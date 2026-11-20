let items = [];
//function to get the input 'the language", etc for API 
function buildUrl(){
    const lang = document.getElementById('lang').value;
    const label = document.getElementById('label').value;
    const keyw = document.getElementById('Keyword').value.trim().replace(/[:"]/g, '');
    const q = `label:"${label}" language:${lang} is:issue is:open no:assignee ${keyw}`;
    return 'https://api.github.com/search/issues?q=' + encodeURIComponent(q) + '&sort=created&order=desc&per_page=30';
}