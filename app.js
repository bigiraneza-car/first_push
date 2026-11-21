let items = [];
let fromCache = false;
//function to get the input 'the language", etc for API 
function buildUrl(){
    const lang = document.getElementById('lang').value;
    const label = document.getElementById('label').value;
    const keyw = document.getElementById('keyword').value.trim().replace(/[:"]/g, '');
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

        //5. one chip per label
        const chips = document.createElement('div');
        issue.labels.forEach(label => {
            const chip = document.createElement('span');
            chip.className = 'chip';
            chip.textContent = label.name;
            chips.appendChild(chip);
        });

        //6. Comments + age
        const meta = document.createElement('p');
        meta.className = 'meta';
        meta.textContent = `${issue.comments}, opened ${timeAgo(issue.created_at)}`;

        //7.Put the pieces in the card, and the card on the page
        card.append(link, repo, chips, meta);
        box.appendChild(card);

    });
}

//search function
async function search() {
    setStatus('Loading...');
    items = await getIssues(buildUrl());
    applyView();  
}

document.getElementById('searchbtn').addEventListener('click', search);


function applyView() {
    let list = items;

    //Filter 1: only issues with no comments
    if (document.getElementById('noComments').checked) {
        list = list.filter(issue => issue.comments === 0);
    }

    //Filter 2: repo name contains the typed text
    const repoText = document.getElementById('repoFilter').value.trim().toLowerCase();
    if (repoText) {
        list = list.filter(issue => issue.repository_url.toLowerCase().includes(repoText));
    }

    //sort
    const sortBy = document.getElementById('sort').value;
    list = [...list].sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
        if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
        if (sortBy === 'most') return b.comments - a.comments;
        return a.comments - b.comments;   //fewest

    });

    render (list);

    if (list.length === 0) {
        setStatus('No issues match your filters.');

    } else {
        setStatus(`Showing ${list.length} of ${items.length} issues` + (fromCache ? 'loaded from cache' : ''));
    }
}

search();