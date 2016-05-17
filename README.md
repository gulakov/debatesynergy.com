DebateSynergy.com open-source web app enables high school and college debate teams to store online research and stream debate rounds.  jQuery-based interface enables formatting user's research files and managing files with a filetree, and users can make custom JS/CSS extensions. Server built with Node.js and MongoDB to store files and Google OAuth for login,  and using socket.io to livestream debate rounds to the room, as the user scrolls speech.


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


[Donate](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=RPK6PTFJ6ZJFC)

2010-2016 Alex Gulakov alexgulakov@gmail.com
