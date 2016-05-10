DebateSynergy.com open-source web app enables high school and college debate teams to store online research and stream debate rounds. Hackers are welcome. jQuery-based interface enables formatting user's research files and managing files with a filetree, and users can make custom JS/CSS extensions. Server built with Node.js and MongoDB to store files and Google OAuth for login,  and using socket.io to livestream debate rounds to the room, as the user scrolls speech.


```
#Linux server setup
sudo apt-get install -y nodejs npm mongodb screen
git clone https://github.com/gulakov/debatesynergy.com
cd debatesynergy.com
npm install
sudo npm run setup

#running
sudo npm run mongo
#press enter
sudo npm start
```


[Donate](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=RPK6PTFJ6ZJFC) 

2010-2016 Alex Gulakov alexgulakov@gmail.com 
