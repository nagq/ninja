const chalk = require('chalk');
const shell = require("shelljs");

const CMD = {
  root: 'git rev-parse --git-dir',
  branch: 'git branch',
  currentBranch: 'git symbolic-ref --short HEAD',
  existDir: (dir) => `[ -d ${dir} ] && echo 1 || echo 0`,
  existFile: (file) => `[ -f ${file} ] && echo 1 || echo 0`,
}

const silent = { silent: true }

const MAX_TITLE = 20;
const formattitle = (title => {
    if (title.length >= MAX_TITLE) {
        return title;
    }
    let s = Array.from({ length: MAX_TITLE - title.length }).fill(' ').join('');
    return `${title}${s}`
})

function openConfig(configFile) {
    shell.exec(`code ${configFile}`, silent, function(code, stdout, stderr) {
        if (code !== 0) {
            shell.exec(`subl ${configFile}`, silent, function(code, stdout, stderr) {
                if (code !== 0) {
                    shell.exec(`gedit ${configFile}`, silent, function(code, stdout, stderr) {
                        if (code !== 0) {
                            console.log('Vscode & sublime not found!')
                            return
                        }
                    })
                    return
                }
            })
        }
    })
}

function branch(options) {
    if (!shell.which('git')) {
        shell.echo('need git command!');
        shell.exit(1);
    }

    shell.exec(CMD.root, silent, function(code, stdout, stderr) {
        const root = stdout.trim();
        shell.exec(CMD.existDir(root), silent, function(code, stdout, stderr) {
            if (stdout.trim() == '0') {
                console.log('fatal: not a git repository (or any of the parent directories): .git')
                return;
            }

            const configFile = `${shell.pwd()}/${root}/ninja.json`;
            const hookFile = `${shell.pwd()}/${root}/hooks/prepare-commit-msg`;

            shell.exec(CMD.existFile(configFile), silent, function(code, stdout, stderr) {
                if (stdout.trim() == '0') {
                    shell.cp(`${__dirname}/tmpl/ninja-git.json`, configFile);
                    shell.cp(`${__dirname}/tmpl/prepare-commit-msg`, hookFile);
                    openConfig(configFile);
                    return;
                }

                if (options.open) {
                    openConfig(configFile);
                    return;
                }

                const list = require(configFile).data.filter(i => i.branch);

                shell.exec(CMD.currentBranch, silent, function(code, stdout, stderr) {
                    const currentBranch = stdout.trim();

                    shell.exec(CMD.branch, silent, function(code, stdout, stderr) {
                        const branchs = stdout.trim().split('\n').map((branch) => {
                            let item = list.find(i => i.branch === branch.trim());
                            if (!item) {
                                item = list.find(i => `* ${i.branch}` === branch.trim());
                                if (item) {
                                    item = { ...item, current: true }
                                }
                            }

                            if (item) {
                                return {
                                    branchOutput: [
                                        item.current ? chalk.redBright(formattitle(branch)) : formattitle(branch),
                                        chalk.cyan(item.title),
                                        item.author ? chalk.yellow('@' + item.author.replace(/\,[\s]*/g, ', @')) : '',
                                    ].join(' '),
                                    ...item,
                                }
                            }
                            return {
                                branchOutput: branch
                            }
                        })
                        if (options.all) {
                            console.log(branchs.map(i => i.branchOutput).join('\n'));
                        } else {
                            console.log(branchs.filter(i => !i.hide).map(i => i.branchOutput).join('\n'));
                        }
                    })
                });
            });
        })
    });
}

module.exports = {
  branch,
}
