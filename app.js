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

//error handling
async function getIssues(url) {
    //stop waiting after 8 seconds
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    try {
        const res = await fetch(url, { signal: controller.signal});

        //403 / 429 = Github rate limit (10 searches per minute without a key)
        if (res.status === 403 || res.status === 429) {
            const reset = Number(res.headers.get('x-ratelimit-reset'));
            const wait = reset ? Math.max(1, Math.ceil(reset -Date.now() / 1000)) :60;
            throw new Error(`Github's free limit was reached. Try again in ${wait} s.`);
        }

        //422 = Githun couldn't understand the search
        if (res.status === 422) {
            throw new Error('Github could not understand that search. Try a simpler keyword.');
        }

        //any other problem
        if (!res.ok) {
            throw new Error(`Github error (${res.status}). Please try again`);
        }
    
        const data = await res.json();
        return data.items;
    } finally {
        clearTimeout(timer);      //always cancel the 8-second timer
    }
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

//search function
async function search() {
    setStatus('Loading...');
    document.getElementById('results').innerHTML = '';

    try {
        items = await getIssues(buildUrl());

        if (items.lenght === 0) {
            setStatus('No issues found. Try another language, label or keyword.')
            return;
        }
        applyView();

    } catch (e) {
        items = [];
        if (e.name === 'AbortError') {
            setStatus('No issues found. Try another language, label or keyword.');
            return;
        } else if (e instanceof TypeError) {
            setStatus('Network problem. Check your internet connection.')
        } else {
            setStatus(e.message);     //our own messages from getIssues
        }
    }
}
document.getElementById('searchbtn').addEventListener('click', search);

// re-filter instantly when the user changes a filter or the sort
document.getElementById('noComments').addEventListener('change', applyView);
document.getElementById('sort').addEventListener('change', applyView);
document.getElementById('repoFilter').addEventListener('input', applyView);

//press Enter key in the keyword box to search
document.getElementById('keyword').addEventListener('keydown', e => {
    if (e.key === 'Enter') search();
});
