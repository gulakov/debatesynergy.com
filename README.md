DebateSynergy.com open-source web app enables debate students to store online research and stream debate rounds.  jQuery-based interface enables formatting user's research files and managing files with a filetree, and users can make custom JS/CSS extensions. Server built with Node.js and MongoDB to store files and Google OAuth for login,  and using socket.io to livestream debate rounds to the room, as the user scrolls speech.


### Components

- **Google API** - Google OAuth2 login, google drive
- **JavaScript/jQuery** - for most interface controls
- **HTML/CSS/font** - layouts and custom iconset as a font
- **D3.js** - data visualization
- **Socket.io** - realtime events from the server
- **Node.js Express** - web server framework with npm packages, in JavaScript ES6
- **MongoDB** - file storage with RegExp searchable index
- **AWS/Ubuntu** - Ubuntu 16.04 on Amazon Web Services t2.micro instance
- **Google Chrome extension** - offline sync


### Install (Ubuntu)

```
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
sudo apt update && sudo apt install -y nodejs npm mongodb-org
git clone https://github.com/gulakov/debatesynergy.com
cd debatesynergy.com
npm install
sudo npm run setup
npm run config
# edit config.json config.mongo.js
```

```
npm run mongo
npm start
```

2010-2017 Alex Gulakov alexgulakov@gmail.com [Donate](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=RPK6PTFJ6ZJFC)
