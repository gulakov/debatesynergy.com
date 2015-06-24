### DebateSynergy.com
Debate Synergy is a web app for high school and college policy & LD debate teams to store online research, discuss debate in the forums, and livestream debate rounds.

Built with NodeJs and MongoDB, using CRUD requests to store user's files in db and socket.io to stream speech, as the user scrolls it, to the room of opposing debaters.

The source code is open source and free for improvements from the debate community, so that users can make custom plugins and suggest feature improvements under the Issues tab.

Linux Installation:
```
sudo apt-get install -y nodejs npm nodejs-legacy mongodb screen build-essential python git 
git clone https://github.com/gulakov/debatesynergy.com
cd debatesynergy.com
npm install
sudo npm run setup

#runnning
sudo npm run mongo
#press enter
sudo npm start
```
