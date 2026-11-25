# FirstPush


**Find beginner-friendly open-source issues in your language, filtered and sorted so you can make your first contribution today. **
- **Live app:** https://www.bigiraneza.tech
- **Demo Video:** https://youtu.be/-7m6pxuLYJ8

## The problem

Many junior developers want to contribute to open source to build a real portfolio, but they don't know where to start. Github has millions of issues, and most of them are too advanced, already taken, or abandoned.

**FirstPush** Solves this by searching Github for open, unassigned issues that maintainers have marked as suitable for beginners ('good first issues', 'help wanted').
Users choose their language, then filter and sort the results to find an issue they can realistically work on today.


## Features
- **Search** by programming language, label ( good first issue | help wanted) and an optional keyword (for example docs, `css`, `test`)
- **Filter** the results:
  - only issues with **no comments yet** (most likely still free to claim)
  - by **repository name**
- **Sort** by newest, oldest, ost comments or fewest comments
- **Issue cards** show the title (linked to Github), the repository, label chips, and how long ago the isue was opened
- **Error handling** with clear messages for:
  - Github's rate limit (403/429), including a countdown until the next search si allowed
  - Searches Github cannot understand (422)
  - Slow responses (the request is cancelled after 8 seconds)
  - no internet connection
  - searches with no results
- **Caching:** results are stored in `localstorage` for 10 minutes. Repeated searches load instantly, show " !!!loaded from cache" and don't use up the rate limit.
- **Security:**
 - the keyword input is trimmed, limited to 40 characters, stripped of ':' and '"' so users can't inject extra search qualifiers, and URL-encoded.
 - Nginx blocks public access to the `.git` and `deploy` folders (403 Forbidden)
- **Responsive design** that works on phones and desktops.

## Tech used

HTML, CSS, JavaScript (no fromeworks) + GitHub REST API + Nginx (web-01, web-02) + HAproxy with SSL (lb-01)


## Run it locally

```bash
git clone https://github.com/bigiraneza-car/first_push.git
cd first_push
python3 -m http-server 8000
```
Open **http://localhost:8000**. No installation or API key is needed.

## API
[Github REST API - search issues](https://docs.github.com/en/rest/search/search#search-issues-and-pull-requests).
It works without a key, so there are no secrets in this repo. The limit is 10 searches per minute, which is why the app caches results.


## Deployment

**Web-01 and web-02:** installed Nginx and Git, cloned the repo to `/var/www/firstpush`, enabled [ `deploy/nginx.config`], disabled the default site, then ran `sudo nginx -t` and `sudo service nginx restart`. Each server adds an `X-Served-By` header with its hostname.

**Lb-01:"" Haproxy shares traffic between the two servers with roundrobin and health checks. It handles HTTPS (SSL termination) and redirects HTTP to HTTPS. Config: `deploy/haproxy.cfg`. The certificate is not in the repo.

**Updating:** run `cd /var/www/firstpush && sudo git pull` on both web servers.


## Challenges
- **Id typos** ('repofilter' vs 'repoFilter') crashed the script -> used the browser console to find errors and matched the ids exactly.
- **Github's rate limit** -> added caching and a countdown message.
- **404 on web-01** -> the folder was 'first_push' but the config said 'firstpush', so I renamed it.

## AI assistance

I used Claude to plan the project, explain concepts, and debug errors. This README was written with AI assistance, which is allowed for this assignment.

## Credits
- Issue data : [Githun REST API](https://docs.github.com/en/rest)
- Background image: AI generated
- Built by Becky-Carmine Igiraneza

