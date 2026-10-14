import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests',testMatch:'*.spec.ts',workers:1,use:{baseURL:process.env.TEST_BASE_URL||'http://localhost:4321',headless:true,launchOptions:{executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',args:['--no-sandbox']}},reporter:'list'});
