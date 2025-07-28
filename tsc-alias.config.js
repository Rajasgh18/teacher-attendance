const { resolve } = require('path');

module.exports = {
  outDir: './dist',
  baseUrl: './src',
  paths: {
    '@/*': ['*'],
    '@/config/*': ['config/*'],
    '@/controllers/*': ['controllers/*'],
    '@/middleware/*': ['middleware/*'],
    '@/models/*': ['models/*'],
    '@/routes/*': ['routes/*'],
    '@/services/*': ['services/*'],
    '@/utils/*': ['utils/*'],
    '@/types/*': ['types/*'],
    '@/db/*': ['db/*']
  }
}; 