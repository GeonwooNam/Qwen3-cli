require('dotenv').config();
const axios = require('axios');
const chalk = require('chalk');
const inquirer = require('inquirer');
const readline = require('readline');
const fs = require('fs-extra');
const path = require('path');
const { marked } = require('marked');
const os = require('os');

class Qwen3CLI {
  constructor() {
    this.config = this.loadConfig();
    this.history = this.loadHistory();
    this.conversation = [];
    this.lastQuery = '';
    this.lastResponse = '';
    this.apiUrl = this.config.apiUrl || process.env.QWEN3_API_URL || 'http://61.97.244.69:41001/v1/chat/completions';
    this.systemPrompt = this.config.systemPrompt || process.env.QWEN3_SYSTEM_PROMPT || '사내 배포된 Qwen3 API를 최대한 활용해보려 해. 너는 그 시스템(개인용)을 구축하는데 도움을 줘야 해.';
    this.loadLastResponse();
  }

  loadConfig() {
    const configPath = path.join(process.cwd(), '.qwen3-cli-config.json');
    try {
      if (fs.existsSync(configPath)) {
        return fs.readJsonSync(configPath);
      }
    } catch (error) {
      console.error('설정 파일 로드 오류:', error.message);
    }
    return {};
  }

  saveConfig() {
    const configPath = path.join(process.cwd(), '.qwen3-cli-config.json');
    try {
      fs.writeJsonSync(configPath, this.config, { spaces: 2 });
    } catch (error) {
      console.error('설정 파일 저장 오류:', error.message);
    }
  }

  loadHistory() {
    const historyPath = path.join(process.cwd(), '.qwen3-cli-history.json');
    try {
      if (fs.existsSync(historyPath)) {
        return fs.readJsonSync(historyPath);
      }
    } catch (error) {
      console.error('히스토리 파일 로드 오류:', error.message);
    }
    return [];
  }

  saveHistory() {
    const historyPath = path.join(process.cwd(), '.qwen3-cli-history.json');
    try {
      fs.writeJsonSync(historyPath, this.history, { spaces: 2 });
    } catch (error) {
      console.error('히스토리 파일 저장 오류:', error.message);
    }
  }

  setSystemPrompt(prompt) {
    this.config.systemPrompt = prompt;
    this.systemPrompt = prompt;
    this.saveConfig();
    
    console.log(chalk.green('✅ 시스템 프롬프트가 영구적으로 변경되었습니다!'));
    console.log(chalk.blue('새로운 프롬프트:'), prompt);
  }

  setTemperature(temperature) {
    const tempValue = parseFloat(temperature);
    if (isNaN(tempValue) || tempValue < 0 || tempValue > 1) {
      console.log(chalk.red('❌ Temperature 값은 0.0과 1.0 사이의 숫자여야 합니다.'));
      return;
    }
    
    this.config.temperature = temperature;
    this.saveConfig();
    console.log(chalk.green('✅ Temperature가 영구적으로 변경되었습니다!'));
    console.log(chalk.blue('새로운 temperature:'), temperature);
  }



  loadLastResponse() {
    const lastResponsePath = path.join(process.cwd(), '.qwen3-cli-last-response.json');
    try {
      if (fs.existsSync(lastResponsePath)) {
        const lastResponse = fs.readJsonSync(lastResponsePath);
        this.lastQuery = lastResponse.query || '';
        this.lastResponse = lastResponse.response || '';
      }
    } catch (error) {
      console.error('마지막 답변 로드 오류:', error.message);
    }
  }

  saveLastResponseToFile() {
    const lastResponsePath = path.join(process.cwd(), '.qwen3-cli-last-response.json');
    try {
      fs.writeJsonSync(lastResponsePath, {
        query: this.lastQuery,
        response: this.lastResponse,
        timestamp: new Date().toISOString()
      }, { spaces: 2 });
    } catch (error) {
      console.error('마지막 답변 저장 오류:', error.message);
    }
  }

  saveLastResponse(filename) {
    if (!this.lastQuery || !this.lastResponse) {
      console.log(chalk.yellow('❌ 저장할 마지막 답변이 없습니다. 먼저 질문을 해주세요.'));
      return;
    }

    const timestamp = new Date().toISOString();
    const content = `# Qwen3 CLI 대화 기록

**시간:** ${timestamp}
**질문:** ${this.lastQuery}

**답변:**
${this.lastResponse}

---

`;

    try {
      fs.appendFileSync(filename, content);
      console.log(chalk.green(`✅ 마지막 답변이 ${filename}에 저장되었습니다.`));
    } catch (error) {
      console.error(chalk.red('파일 저장 오류:'), error.message);
    }
  }

  async setupConfig() {
    console.log(chalk.blue('🔧 Qwen3 CLI 설정'));
    
    const questions = [
      {
        type: 'input',
        name: 'apiUrl',
        message: 'API URL을 입력하세요:',
        default: this.config.apiUrl || process.env.QWEN3_API_URL || 'http://61.97.244.69:41001/v1/chat/completions'
      },
      {
        type: 'input',
        name: 'systemPrompt',
        message: '기본 시스템 프롬프트를 입력하세요:',
        default: this.config.systemPrompt || this.systemPrompt
      },
      {
        type: 'input',
        name: 'temperature',
        message: '기본 temperature 값을 입력하세요 (0.0-1.0):',
        default: this.config.temperature || process.env.QWEN3_TEMPERATURE || '0.9',
        validate: (value) => {
          const num = parseFloat(value);
          return (num >= 0 && num <= 1) ? true : '0.0과 1.0 사이의 값을 입력하세요';
        }
      }
    ];

    const answers = await inquirer.prompt(questions);
    this.config = { ...this.config, ...answers };
    this.apiUrl = answers.apiUrl;
    this.systemPrompt = answers.systemPrompt;
    this.saveConfig();
    
    console.log(chalk.green('✅ 설정이 저장되었습니다!'));
  }

  showHistory() {
    console.log(chalk.blue('📚 대화 이력'));
    if (this.history.length === 0) {
      console.log(chalk.yellow('대화 이력이 없습니다.'));
      return;
    }

    this.history.forEach((entry, index) => {
      console.log(chalk.cyan(`\n[${index + 1}] ${entry.timestamp}`));
      console.log(chalk.white(`질문: ${entry.query}`));
      console.log(chalk.green(`답변: ${entry.response.substring(0, 100)}...`));
    });
  }

  async startInteractive() {
    console.log(chalk.blue('🤖 Qwen3 CLI 대화형 모드'));
    console.log(chalk.gray('종료하려면 "quit", "exit", "bye"를 입력하세요.'));
    console.log(chalk.gray('도움말을 보려면 "help"를 입력하세요.\n'));

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const askQuestion = () => {
      rl.question(chalk.cyan('질문: '), async (input) => {
        const trimmedInput = input.trim();
        
        if (trimmedInput.toLowerCase() === 'quit' || 
            trimmedInput.toLowerCase() === 'exit' || 
            trimmedInput.toLowerCase() === 'bye') {
          console.log(chalk.yellow('👋 안녕히 가세요!'));
          rl.close();
          return;
        }

        if (trimmedInput.toLowerCase() === 'help') {
          this.showHelp();
          askQuestion();
          return;
        }

        if (trimmedInput.toLowerCase().startsWith('save ')) {
          const filename = trimmedInput.substring(5).trim();
          if (filename) {
            this.saveLastResponse(filename);
          } else {
            console.log(chalk.yellow('❌ 파일명을 입력해주세요. 예: save output.md'));
          }
          askQuestion();
          return;
        }

        if (trimmedInput === '') {
          askQuestion();
          return;
        }

        try {
          await this.processQuery(trimmedInput, { format: 'text' });
        } catch (error) {
          console.error(chalk.red('오류가 발생했습니다:', error.message));
        }

        askQuestion();
      });
    };

    askQuestion();
  }

  showHelp() {
    console.log(chalk.blue('\n📖 도움말'));
    console.log(chalk.white('사용법:'));
    console.log(chalk.gray('  qwen <질문>                    - 단일 질문'));
    console.log(chalk.gray('  qwen -i                        - 대화형 모드'));
    console.log(chalk.gray('  qwen -s <파일명> <질문>        - 결과 저장'));
    console.log(chalk.gray('  qwen -l <파일명>               - 마지막 답변 저장'));
    console.log(chalk.gray('  qwen -h                        - 대화 이력 확인'));
    console.log(chalk.gray('  qwen -f markdown <질문>        - 마크다운 형식 출력'));
    console.log(chalk.gray('  qwen -p "<프롬프트>" <질문>    - 임시 시스템 프롬프트 설정'));
    console.log(chalk.gray('  qwen -P "<프롬프트>" <질문>    - 영구 시스템 프롬프트 설정'));
    console.log(chalk.gray('  qwen -S "<프롬프트>"            - 시스템 프롬프트만 영구 변경'));
    console.log(chalk.gray('  qwen -t <값> <질문>            - temperature 설정'));
    console.log(chalk.gray('  qwen -T <값>                   - temperature만 영구 변경'));
    console.log(chalk.gray('  qwen -c                        - 설정 변경'));
    console.log(chalk.gray('  quit/exit/bye                  - 종료'));
    console.log(chalk.gray('  help                           - 이 도움말 표시'));
    console.log(chalk.gray('  save <파일명>                  - 마지막 답변 저장 (대화형 모드)\n'));
  }

  async processQuery(query, options = {}) {
    const format = options.format || 'text';
    const saveFile = options.save;
    const customSystemPrompt = options.systemPrompt;
    const permanentPrompt = options.permanentPrompt;
    const temperature = parseFloat(options.temperature || this.config.temperature || '0.9');

    // 영구 시스템 프롬프트 설정
    if (permanentPrompt) {
      this.config.systemPrompt = permanentPrompt;
      this.systemPrompt = permanentPrompt;
      this.saveConfig();
      
      console.log(chalk.green('✅ 시스템 프롬프트가 영구적으로 변경되었습니다!'));
    }

    console.log(chalk.blue('🤔 질문을 처리 중...\n'));

    try {
      const response = await this.callQwen3API(query, customSystemPrompt, temperature);
      
      // 마지막 답변 저장
      this.lastQuery = query;
      this.lastResponse = response;
      this.saveLastResponseToFile();
      
      // 응답 출력
      if (format === 'markdown') {
        console.log(chalk.green('📝 답변:'));
        console.log(marked(response));
      } else {
        console.log(chalk.green('📝 답변:'));
        console.log(response);
      }

      // 파일 저장
      if (saveFile) {
        await this.saveToFile(saveFile, query, response, format);
      }

      // 히스토리에 저장
      this.addToHistory(query, response);

    } catch (error) {
      console.error(chalk.red('❌ API 호출 오류:'), error.message);
      throw error;
    }
  }

  async callQwen3API(query, customSystemPrompt, temperature) {
    const messages = [
      {
        role: 'system',
        content: customSystemPrompt || this.systemPrompt
      },
      ...this.conversation,
      {
        role: 'user',
        content: query
      }
    ];

    const requestBody = {
      messages: messages,
      temperature: temperature
    };

    try {
      const response = await axios.post(this.apiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      const assistantMessage = response.data.choices[0].message.content;
      
      // 대화 기록에 추가
      this.conversation.push(
        { role: 'user', content: query },
        { role: 'assistant', content: assistantMessage }
      );

      // 대화 기록이 너무 길어지면 앞부분 제거 (최대 20개 메시지 유지)
      if (this.conversation.length > 20) {
        this.conversation = this.conversation.slice(-20);
      }

      return assistantMessage;
    } catch (error) {
      if (error.response) {
        throw new Error(`API 오류 (${error.response.status}): ${error.response.data.error || error.response.statusText}`);
      } else if (error.request) {
        throw new Error('서버에 연결할 수 없습니다. API URL을 확인해주세요.');
      } else {
        throw new Error(`요청 오류: ${error.message}`);
      }
    }
  }

  async saveToFile(filename, query, response, format) {
    try {
      const timestamp = new Date().toISOString();
      let content;
      
      if (format === 'markdown') {
        content = `# Qwen3 CLI 대화 기록

**시간:** ${timestamp}  
**질문:** ${query}

**답변:**

${response}

---

`;
      } else {
        content = `# Qwen3 CLI 대화 기록

**시간:** ${timestamp}
**질문:** ${query}

**답변:**
${response}

---

`;
      }

      await fs.appendFile(filename, content);
      console.log(chalk.green(`✅ 결과가 ${filename}에 저장되었습니다.`));
    } catch (error) {
      console.error(chalk.red('파일 저장 오류:'), error.message);
    }
  }

  addToHistory(query, response) {
    const entry = {
      timestamp: new Date().toLocaleString('ko-KR'),
      query: query,
      response: response
    };

    this.history.unshift(entry);
    
    // 히스토리가 너무 길어지면 제한 (최대 100개)
    if (this.history.length > 100) {
      this.history = this.history.slice(0, 100);
    }

    this.saveHistory();
  }
}

module.exports = Qwen3CLI; 