const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

const renderTemplate = async (templateName, data) => {
    const filePath = path.join(__dirname, '../templates', `${templateName}.hbs`);
    const templateContent = await fs.readFile(filePath, 'utf-8');
    const template = handlebars.compile(templateContent);
    return template(data);
};

module.exports = {
    renderTemplate,
};