let items = [];
//function to get the input 'the language", etc for API 
function buildUrl(){
    const lang = document.getElementById('lang').value;
    const label = document.getElementById('label').value;
    const keyw = document.getElementById('Keyword').value.trim().replace(/[:"]/g, '');
    const q = `label:"${label}" language:${lang} is:issue is:open no:assignee ${keyw}`;
    return 'https://api.github.com/search/issues?q=' + encodeURIComponent(q) + '&sort=created&order=desc&per_page=30';
}

async function getIssues(url) {
    const res = await fetch(url);
    const data = await res.json();
    return data.items;
}

function setStatus(text) {
    document.getElementById('status').textContent = text;
}

// convert time for easy read
function timeAgo(dateText) {
    const ms = Date.now() - new Date(dateText);
    const days = Math.floor(ms / 86400000);
    if (days === 0) return 'today';
    if (days === 1) return '1 day ago';
    return days + 'days ago'
}

//render the results
function render(list) {
    const box = document.getElementById('results');
    box.innerHTML ='';     //1.clear old cards

    list.forEach(issue => {    //2. loop over every issue
        const card = document.createElement('article');
        card.className = 'card';

        // 3. Title as link to the issue on Github
        const link = document.createElement('a');
        link.href = issue.html_url;
        link.target = 'blank';
        link.rel ='noopener';
        link.textContent = issue.title;


        //4.repo name, e.g: 'django'
        const repo =document.createElement('p');
        repo.className = 'repo';
        repo.textContent = issue.repository_url.split('/').slice(-2).join('/');
        



    })
}