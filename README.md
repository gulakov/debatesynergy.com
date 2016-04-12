
DebateSynergy.com is a free open-source web app for the high school and college debate community, enabling users to make custom plugins and suggest features. Built with Node.js and MongoDB, using jQuery & Bootstrap interface to format user's research files and manage files with a filetree, and using socket.io to livestream debate rounds to the room, as the user scrolls speech.


```
#Linux server setup
sudo apt-get install -y nodejs npm nodejs-legacy mongodb screen build-essential python git 
git clone https://github.com/gulakov/debatesynergy.com
cd debatesynergy.com
npm install
sudo npm run setup

#running
sudo npm run mongo
#press enter
sudo npm start
```


[![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=RPK6PTFJ6ZJFC) (c) 2015 Alex Gulakov alexgulakov@gmail.com
