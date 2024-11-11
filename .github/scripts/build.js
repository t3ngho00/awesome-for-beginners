const fs = require('fs');
const data = require('../../data.json');

const TPL_FILE = './.github/tpl.md';
const TARGET = './README.md';

const tpl = getTemplate(TPL_FILE);

const categories = {};

data.repositories.sort((a, b) => a.name.localeCompare(b.name))
    .forEach(repo => {
        repo.technologies.forEach(tech => {
            if (!categories.hasOwnProperty(tech)) {
                categories[tech] = [];
            }
            categories[tech].push(repo);
        });
    });

const sortedCategories = Object.fromEntries(
    Object.entries(categories).sort((a, b) => a[0].localeCompare(b[0]))
);

const toc = Object.keys(sortedCategories)
    .map(t => `- [${t}](#${data.technologies[t] || t.toLowerCase()})`)
    .join('\n');

const content = Object.keys(sortedCategories)
    .map(category => {
        const repos = sortedCategories[category]
            .map(repo => `- [${repo.name}](${repo.link}) _(label: ${repo.label || 'n/a'})_ <br> ${repo.description}`)
            .join('\n');
        return `## ${category}\n\n${repos}\n`;
    }).join('\n');

const sponsorList = data.sponsors.map(sponsor => 
    `<td align="center"><a href="${sponsor.link}"><img src="${sponsor.image}" width="60px;" alt=""/><br/><sub><b>${sponsor.name}</b></sub></a></td>`
);
const sponsorRows = Math.ceil(sponsorList.length / 6);

let sponsors = '';

for (let i = 0; i < sponsorRows; i++) {
    sponsors += '<tr>';
    for (let j = 0; j < 6; j++) {
        const index = i * 6 + j;
        if (index < sponsorList.length) {
            sponsors += sponsorList[index];
        } else {
            sponsors += '<td></td>';
        }
    }
    sponsors += '</tr>';
}

sponsors = `<table>${sponsors}</table>`;

saveFile(TARGET, render(tpl, { toc, content, sponsors }));

function getTemplate(file) {
    try {
        return fs.readFileSync(file, 'utf8');
    } catch (err) {
        console.error(`Error reading template file: ${err}`);
        process.exit(1);
    }
}

function saveFile(file, contents) {
    try {
        fs.writeFileSync(file, contents);
    } catch (err) {
        console.error(`Error writing to file: ${err}`);
        process.exit(1);
    }
}

function render(template, variables) {
    Object.entries(variables).forEach(([key, value]) => {
        template = template.replace(new RegExp(`<% ${key} %>`, 'g'), value);
    });
    return template;
}