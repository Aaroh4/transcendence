<p>Works on Mac and Linux!</p>
</br>
<p>Basic build</p>
<pre><code>make</code></pre>
<p>Build and run without docker:</p>
<pre><code>make devbuild && make dev</code></pre>
<p>Run docker:</p>
<pre><code>make dockerstart</code></pre>
<p>Clean non-docker</p>
<pre><code>make devclean</code></pre>
<p>Clean docker</p>
<pre><code>make dockerclean</code></pre>
<p>Full clean</p>
<pre><code>make fclean</code></pre>


<p>ENV OPTIONS: </p>
<pre><code>
PORT=4000
UDP_PORT=55000-57000
HOST=0.0.0.0
NODE_ENV=development
DB_FILE=../database/database.db
DEFAULT_AVATAR=./server/avatars/default_avatar.jpg
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
CLIENT_ID=
CLIENT_SECRET=
STUN_URL=stun:stun.l.google.com:19302
TURN_URL=turn:turn:3478
TURN_USER=user
TURN_PASS=pass
CAPTCHA_SECRET=
HOST_LAN_IP=
REDIRECT_URI=
AUTHSERV=
</code></pre>