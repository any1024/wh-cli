#!/usr/bin / env node
const chalk = require('chalk')
const fs = require('fs')
const program = require('commander')
const download = require('download-git-repo')
const inquirer = require('inquirer')
const ora = require('ora')
const symbols = require('log-symbols')
const handlebars = require('handlebars')

program
  .version(require('./package').version, '-v, --version')
  .command('init <name>')
  .action(name => {
    console.log(chalk.green('init创建'), name)

    inquirer
      .prompt([
        {
          type: 'input',
          name: 'author',
          message: '请输入你的名字'
        }
      ])
      .then(answers => {
        console.log(answers.author)
        const lgProcess = ora('正在创建...')
        lgProcess.start()
        download(
          'direct:https://github.com/Overcase/custom_site.git',
          name,
          { clone: true },
          err => {
            if (err) {
              lgProcess.fail()
              console.log(symbols.error, chalk.red(err))
            } else {
              lgProcess.succeed()
              const fileName = `${name}/package.json`
              const meta = {
                name,
                author: answers.author
              }
              if (fs.existsSync(fileName)) {
                const content = fs.readFileSync(fileName).toString()

                const pkgObj = JSON.parse(content)
                const result = Object.assign(pkgObj, meta)

                // const result = handlebars.compile(content)(meta)

                // 注入内容
                fs.writeFileSync(fileName, JSON.stringify(result, null, 2))
              }
              console.log(symbols.success, chalk.green('创建成功'))
            }
          }
        )
      })
  })
program.parse(process.argv)