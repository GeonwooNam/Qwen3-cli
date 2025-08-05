#!/usr/bin/env node

const { program } = require('commander');
const Qwen3CLI = require('../src/qwen3-cli');

program
  .version('1.0.0')
  .description('Qwen3 API CLI 도구');

program
  .option('-s, --save <filename>', '결과를 파일로 저장')
  .option('-h, --history', '대화 이력 확인')
  .option('-f, --format <format>', '출력 형식 (text, markdown)', 'text')
  .option('-p, --system-prompt <prompt>', '임시 시스템 프롬프트 설정')
  .option('-P, --permanent-prompt <prompt>', '영구 시스템 프롬프트 설정')
  .option('-S, --set-prompt <prompt>', '시스템 프롬프트만 영구 변경')
  .option('-t, --temperature <value>', 'temperature 값 설정', '0.9')
  .option('-T, --set-temperature <value>', 'temperature만 영구 변경')
  .option('-c, --config', '설정 파일 생성/수정')
  .option('-i, --interactive', '대화형 모드')
  .option('-l, --last-save <filename>', '마지막 답변을 파일로 저장')
  .parse();

const options = program.opts();
const args = program.args;

const cli = new Qwen3CLI();

if (options.config) {
  cli.setupConfig();
} else if (options.history) {
  cli.showHistory();
} else if (options.setPrompt) {
  cli.setSystemPrompt(options.setPrompt);
} else if (options.setTemperature) {
  cli.setTemperature(options.setTemperature);
} else if (options.lastSave) {
  cli.saveLastResponse(options.lastSave);
} else if (options.interactive || args.length === 0) {
  cli.startInteractive();
} else {
  const query = args.join(' ');
  cli.processQuery(query, options);
} 