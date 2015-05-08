//res.redirect('back');
// Be sure to update the users array when changing user DB, e.g. pw change.
// res.setHeader('Location', '/');
// res.location('/customers/' + inst._id);
// Express version of my Tweater app by David K. Crandall, (C) 2015.
// --*** When registering, change whitespace in name to a single space with .replace(/\s+/g, " ").
/* To put funcs in separate files:
File: myfunc.js:
//Myfunc constructor:
var Myfunc = function() {
};
// Description here.
Myfunc.prototype.parse = function(text) {
...
};
module.exports = Myfunc;
(end of file myfunc.js)
-----------
Used thus in another file:
var Myfunc = require('./myfunc'); 
var f = new Myfunc();
console.log(f.parse("hi there")); 
*/

// fix utf8 encoding problem
// Use JSDoc style comments:
/**
 * @fileOverview Tweater Twitter-like social media application.
 * @version 2.0
 * @author <a href="mailto:davareno58@gmail.com">David K. Crandall</a>
 * @see <a href="http://crandall.altervista.org/tweater">Tweater</a>.
 *
 * Initialize constants.
 * @constant {string} CRYPT_SALT Salt for encryption.
 * @constant {string} DATABASE_HOST Database host.
 * @constant {string} DATABASE_NAME Database name.
 * @constant {string} DATABASE_TABLE Database user table.
 * @constant {string} FONTSIZE Size of font in pixels.
 * @constant {string} MY_PATH Path to this file's directory.
 * @constant {string} PASSWORD Database password. ***
 * @constant {string} SCRIPTS_EXTERNAL HTML to include external JavaScripts.
 * @constant {string} SELF_NAME Name of this Node.js file.
 * @constant {string} SITE_ROOT This site's root directory.
 * @constant {string} TWEATMAXSIZE Maximum number of characters allowed in a Tweat message.
 * @constant {string} USERNAME Database username.
 */

CRYPT_SALT = "x";
DATABASE_HOST = '192.168.0.3';
DATABASE_NAME = "my_crandall";
DATABASE_TABLE = "users";
EMAIL_PASSWORD = 'z'; // --*** Email password
FONTSIZE = "18"; // pixels
MY_PATH = 'c:/users/dave/node/tweater_node';
PASSWORD = 'y'; // --*** Database password
SELF_NAME = "/";
SITE_ROOT = "/";
TWEATMAXSIZE = "250"; // characters
USERNAME = "crandall";

// Initialize requires
app = require("express")();
bodyParser = require("body-parser");
busboy = require("connect-busboy"); 
cookieParser = require("cookie-parser") ;
Cookies = require("cookies"); 
crypto = require("crypto"); // encryption
express = require("express");
//formidable = require("formidable"); 
fs = require("fs"); // file system
heredoc = require("heredoc");
http = require("http");
morgan = require("morgan");
mysql = require("mysql"); // MySQL
nodemailer = require("nodemailer"); // for sending email
qs = require("querystring");
url = require("url");
utf8 = require("utf8"); // character encoding
util = require("util"); 
var _ = require("underscore");
//Cookies = require("../node_modules/cookies");
//heredoc = require("../node_modules/heredoc");
//nodemailer = require("../node_modules/nodemailer"); // for sending email

transporter = nodemailer.createTransport({ service: 'Gmail', auth: { user: 'davareno58@gmail.com', pass: EMAIL_PASSWORD } }); // ***
console.log("argv:" + process.argv);
console.log("cwd:" + process.cwd);
//parsedURL = {}; // not needed

/**
 * Create globals:
 *
 * @private {string} [chat="false"] Chat Mode status.
 * @private {string} email User email address.
 * @private {string} esc_name Version of user's name with space(s) changed to "+" for GET querystring.
 * @private {string} followed_ones_list List of user's followed users.
 * @private {string} follower_email Follower email address.
 * @private {number} followers_count Total of user's followers.
 * @private {string} [font="Helvetica"] Font family.
 * @private {string} [font_size="18"] Size of font in pixels.
 * @private {string} header User HTML header.
 * @private {string} help_html Help HTML text, also used on 404 page.
 * @private {string} index_html Index HTML text.
 * @private {string} interests User interests and information.
 * @private {string} interests_position Position on home page of user interests and information.
 * @private {string} interests_width Width on home page of user interests and information.
 * @private {string} interests_words List of user interests and information, including user's name and username.
 * @private {string[]} interests_array Array with list of user interests and information.
 * @private {string} margin_left Left margin on home page of user.
 * @private {string} message Message for user.
 * @private {string} name Name of user.
 * @private {string} password User's password.
 * @private {string} password_hash Encryption hash of user's password.
 * @private {string} password_reset_hash Encryption hash of password reset code.
 * @private {string} [pic_position="Top"] Position of user's uploaded image file.
 * @private {number} [pic_scale=1] Scale of user's uploaded image file.
 * @private {string} [pic_visible="Show"] Visibility of user's uploaded image file.
 * @private {string} picture_ext Extension of user's uploaded image file.
 * @private {string} port Port for Tweater app website.
 * @private {string} post_body Variable names and values from POST.
 * @private {string{}} query object with keys and values from GET querystring variables.
 * @private {string{}} result User search result object.
 * @private {string} ret Browser version.
 * @private {number} [shown_limit=50] Maximum number of Tweats and Search Results.
 * @private {string} sign_in_width Width of sign-in page.
 * @private {string} [status=0] Administrator status.
 * @private {string} stay_logged_in User preference for remaining signed in.
 * @private {string} [text_color="black"] Text color (black or white).
 * @private {string} title_position Position of title on page.
 * @private {string} tweat Public message posted by user.
 * @private {string} tweat_list List of formatted Tweats posted by user and user's followed users, if any.
 * @private {number} [tweat_notify=0] Preference for receiving emails of Tweats posted by followed users, if any.
 * @private {number} [tweat_width=80] Maximum width in characters of Tweats on user's page.
 * @private {string} unsubscribe_password User password for unsubscribing.
 * @private {string} upload_picture_html HTML for choosing an image to upload.
 * @private {string} user Signed-in user.
 * @private {string} user_name Username of signed-in user.
 * @private {string} user_rows Results from users database from sign-in.
 */

chat = 'false';
cookies = null;
email = "";
esc_name = "";
followed_ones_list = "";
follower_email = "";
followers_count = 0;
font = "Helvetica";
font_size = "18";
header = "";
help_html = "";
index_html = "";
interests = "";
interests_position = "";
interests_width = "";
interests_words = "";
interests_array = [];
margin_left = "";
message = "";
name = ""; // client name
password = "";
password_hash = "";
password_reset_hash = "";
pic_position = "Top";
pic_scale = 1;
pic_visible = "Show";
picture_ext = null;
port = process.env.PORT || 8888;
post_body = "";
query = {};
result = {};
ret = ""; // browser version
shown_limit = 50;
sign_in_width = "";
stay_logged_in = "";
status = "";
text_color = "black";
title_position = "";
tweat = "";
tweat_list = "";
tweat_notify = 0;
tweat_width = 80;
unsubscribe_password = "";
upload_picture_html = "";
user = "";
user_name = "";
user_rows = {0:{"interests":""}};

// External JavaScripts HTML and old MSIE shim

  SCRIPTS_EXTERNAL = '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/' +
'bootstrap.min.css"><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-' +
'theme.min.css"><script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>' + 
'<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script>' + 
'<!--[if lt IE 9]><script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script><![endif]-->';

// Turing test JavaScript against robots
  turing = '<SCRIPT LANGUAGE="JavaScript">' + 
'  function turingsetup() {' + 
'    var firstnumber = Math.floor((Math.random() * 9) + 1);' + 
'    var secondnumber = Math.floor((Math.random() * 90) + 1);' + 
'    document.getElementById("firstnumber").innerHTML = firstnumber;' + 
'    document.getElementById("secondnumber").innerHTML = secondnumber;' + 
'    document.getElementById("answer_added").value = firstnumber + secondnumber;' + 
'  };' + 
'  </SCRIPT>';

// Tweat email with Tweaty email picture encoded
var tweamail = '<img src="data:image/png;base64,\
iVBORw0KGgoAAAANSUhEUgAAAQIAAADXCAYAAADxy194AAAAAXNSR0IArs4c6QAAAARnQU1BAACx\
jwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAA02SURBVHhe7d3bceW4EYDhkQPwo1PYEBySw3Bt\
GBuSQ9gU/OgE5NMqYbYPBgBxa6BB/l+VarUjHepciJ9NajT6+OPP/37+APBof/v+L4AHIwQACAEA\
QgDghRAAIAQACAGAF0IAgBAAIAQAXggBAEIAgBAAeCEEAAgBgB8/+PcIHuZfv/3j+706r/3j+z3c\
GSF4gNbFX0IY7okQ3FTN4v/8z9+/33v38c//fb+XRxDuhRDcTCkAuYVfIxcHgnAPhOBGUhEYWfwp\
BOGeCMENrAhAShwFYnAuQnC4OAIWAdALPt5+akIgCOchBAerjUBqsdYEI3caIK6CQAzOQggO1DIF\
lBazaIlHjBjcB3+z8DAjEfj8/Px601ILPne7+Pa/fF50X1LXLuATIThIbwTiBazfF6kYBPHniqsY\
6PtFDM5ACA4xEoGU3J/X3LYGMTgLIThQKQItikf2iwiUbhsQg3MQggPoRXQVgZEjem5B59Rsnxic\
gRA41xKBHq2xGEUMfCIEjo1EYGSBy20/Pj7e3q6UpgmLgGEuQuCU9SRQklr4NTEo4RTBN0JwI63n\
+FdkMriaLFomD2LgFyFwyHoa0CN/6Ugff6z0uTgbIXBmRQS0qyP67MXPVOATIUDTeD8DMfCHEDiy\
ehoQ8me1R/3VwcA6hMAhiwh4w1TgCyFwwtNikCO/PvrH/6+NXEN4QvBOQQgcmHVKcHXb1tG+FIDZ\
mAr2IgQPs2ph1+IUwQdC4MjMUbk0sl/FoGfcZ8w/GyHYbNdRMIz9IxPCyPUBjYjsRwicmLUYWrej\
F7O+7axF3orTgz0IwUbWO33LYp4VkF6zQog+hMCB2Yug9sie+ljNbVsC04OpYD1C8ACphav/LA5R\
HAP9ufG2ZkcMe/B7DTayOvKFxVnzY8mlhXx1e4sI6K/J70VYh4lgE8vxVxbTaARE7uPy5xYRwD5M\
BBukIvD579++36v38fuf3+/18bqYQ8SYCNYhBBuEEPQs/lYtsfASBk4P1iMEG+iJYEUMYjVx2BkF\
QrAeIdhkdwy0Uhh2BYHTg7W4WIivEIW3mCxIfYRezfKiKv5iOhGsfBFPPHKsvFbQIzUprJoQOD1Y\
i4nAgdGr/1ZSU8KqCcHrdzTuihDgUi4IuI9lIdA/9jr6hj12xYDrBPaOmwhSf2/+dPEC8yyeDpgM\
7oFTg01ajnJyDSG8ebEiBlwnWOeoENxxGriiF//b4nMQBiaD+zh2Ijj5WoGeBvRiKokj4MWqGHCd\
wNYxIbjDNCA7c2sE5HNyEai5PVDjyIngxGkgPqL1LuIQBk8RIEjne+zFwvjobCX1de68cGafHnDB\
cI0jQqBPC2ZMA3phhoUaL9YRuW16O5IDwWMngpSeIOhFn7s9AYB3y37oqPdIXpoG9MdafjAl3K+w\
OK2uwj9p8b9dxJw8zuvTDX4AycajJ4Kw84YjdnjrNWs7J+Oc/kyuJ4KrawOjE4F46oJNTUG9z4Xl\
NCCYCOw9ciLQO5PVaYF3qanlqc8FHIdAH+2tPXkBjE5E1tOA4HTD3hETwYxvGcbiEfOpMXhbyI1R\
WBEBrOHyGkE8DeRu23uNQNP3caXRI/GIXPRa7tPqCITrBFwjsOE+BKXbzQiB2BWDmEUcaiad3gCI\
VZMAIbDlLgS104CYFQKRisHMhVmzIFdrfXy7IiAIgS3XIbi6zcwQBNZBiK0MRO/jSN3H1dcE+Bai\
LVchaJkGhEUIRCoGwjIIKT2RsJ5idl0UJAS23Iag9fMtdg4vQVgpF59dAQgIgS03IWidBoR1CIJc\
EMQdolCaPHYHICAEtghBo1IUxAlhqDnl8BKAgBDY4tSg01UQYrsC0XKdwdvi1wiBLVchEC0x2BmC\
WGsYYr2haFnoKZ4Xv0YIbBECI6NhsHDKok8hBLbc/ayBXvx6oZ9Gdla9w8oiXLUQw9eK34AcdxOB\
iAOQu63niSAIzwELcQwTgS2XP33YEg0A41xOBKJmKmAieI5VE0HvtZ3TpxS3IRB6oROCZ5sVgt6F\
Psp7KFyHQJRiQAieoycEuxZ9LU/77G1CMIPFC/P2HBCDbiEEpdeodeFbvh46XDV2R8F9CEQuBrND\
kDPyIhGCOXIhqFn8np73mkDsiMJxIRBhW2+BaHyxW4uttbxQhGCOOASlAJz0PJf2w5VBOCIEIjUV\
jITgSm0orl4sQjDH1etxh+c29xhXBOHIEAjZnmUIUq52xtQLRgjmyD33d31O48drHYNjfsHJaEhm\
kJ1Ov8Vk0euFjzlSEci9BncRPz7r/eqYEAgdg3hC2CG3M+oXbcVYd3fxc5x6zu9qVQyOCoFXqSCE\
F40JYY7wHMfP8xPox2y1P5mFwOoOezhFyIl3VCKAU5iE4OkLIAQhDgPQy3o/WnZqIOf0s95OQxAw\
6uo7VqO4RmBMXkDrF/HuwnPI82iHEBjSOy47cp/4OXvic6gfs9V3oUz+QpG+RvDkkTi8gPLiheeE\
U4Q2uYX/lOcxfvxWIWAiMPLEI9dK8vze+TmOH58EwCoCwiQE+g7f/QVLiV9A7WnPxSy5hXC3/Sv1\
eCwDECz7WQNx93Gu9AKOnC7F233S6UV47PFiKH2L+rTnJ359gxUBCExDIFIv2N125NQLmXoRe68T\
5HaUuwdBP+7coigFIfD2POVez2BlAALzEAS5F+zknbm15KMhkN+GFP9mozvHoCYEWk0UNOvn7mrB\
x3YEIFgWgqD0YnnfqUdLrh97y2PVXzf8ajQdhLCt+P6dHonweHoWSGsUdti58GPLQxDUvlC7duba\
mre8mL0hEOH+6N+RGGIg28rd35av4y0kIyHI2RUIT4s+ZVsItJEXp3dnrV3oKSMvanisM0OgxRPD\
SAiCHUHQ92XlIurdF70v9CsuQhDbVe2cmS+yfmxhgZWiFH9OKQS5j9UuZP01ftn24hjsCsFTuQxB\
jnUgVuxwrSEQ8nmtIRCtU4G+H2FbqaDE99ciEuFrEIE1jgrBXYQYxAsrt5C1XAhKt21ZqKXgyHbi\
CAQzY6C/BiFYg79i7JgsxniBt7JaoDPuG/wgBBvFR9fUBCByCy4sRv1x2UZuO/L1cm8tUvendRs1\
mAbWIQQbxDu4PmqXYpBagJq+rWyzZRroXchX96mVRVBwjRBsFnb8mhiUxBEoCVGJ41KzCOOF33Nf\
4Q8hcKQ3Bi0RSImD0KPn68Z0iDgtWIsQbJLb0Ucmg9rFmNtuLgYhFPrjso3W+we/+PbhRqm/UxDE\
Y3pukbZOA3q7uW1eaf2atcJ9YxpYj4lgo9IO37rAaj9ff17PEd06AtiDEDiRWgijizand7tWEdCY\
BvYgBM5ZLbiRyMy+T0wD+xGCzfQR8GpBzJwKRByD0vZnf234QggOYDUViNZtW04DnBbsQwgcmDEV\
jIzX8WSwAxHYixA4cbUQckfit+/tT4rBKiP3F3MRAodap4JUDOS/4a3ViqlA3y+mgf0IgSNXpwil\
o/aMyWDHVAAfCMGhUkft3r8pmGJxLSJgGvCHEDgzMhUIiUF462F9LYII+EQIHKqNgfW5vPW1CPhB\
CA5nEQOraxH685kGfCEETrWcIlhOBqlt95x2EAHf+DFk50o/qixqjsqlI3xJ2PbVwg+xyH2d+D4S\
An+YCJxrmQxSeiMgwm1nThxEwCdCcJhcDHJvs/TGQN9fIuAXIThAvIBSMbCiY9IaAyJwDq4RHCT+\
lW8zj/hXauLzFg0icBQmgoN4mQxSwsflPsX3Kw4Y/GEiONDOyaCkFCamAt8IwcE8BSGOgJ4QAmLg\
F6cGB9t5qhDI18xFAOcgBIdLxWBVEFIBiCOg/59rBX5xanAjqYU2++ici8zV19G34xTBHyaCG0kt\
sFkTwuh2mAx8YyK4qZrFVjqK5xZ9iI3efsvUobfLZOAHIXiAGUfgVABEz6kHMfCHEDxMSxTiRToj\
AgEx8IUQoMrMCATEwA8uFqLZjAgIvZ0Zpy/oRwhwSS/SWRFIIQb7EAIUWUfAMiyoRwiQtWoS4BRh\
P0IAF4jBXoQASaumAfhACPCLXRFgKtiHEMAVYrAHIcAbTgmeiRDAHaaC9QgBfmIaeC5CAJeYCtYi\
BPgF08DzEAJ88XjUJUjrEAK88br4OD2wRQgAEAL4PtpyerAGIQBACPAX70dfrhPYIQQPx+KCIARw\
j+sE9ggBAEIAgBDg2ynjN9c0bBACAIQAACEA8EIIMJ38TkP9ew3hHyEAQAgwl54ELKYCfmuyDUKA\
L4zyz0YIME0qJgTmDITg4U4YtYmJPUKAKfRilbjowLCQ/SME+Mn7guVCoR1CgOEFFk8DwYypgGli\
DUKAN60LLxeBYCQGV9vGPIQAX3oWbO3nWW4bcxAC/NSyYOOPtxyxLbeNPh+vJ/nz+33gS+pn/uXf\
K8gt4JaF2vrvCRCBNQgBkmoWbO8irY0BEViHEKAotWhnLdBcEAjAeoQAABcLARACAC+EAAAhAEAI\
ALwQAgCEAAAhAPBCCAAQAgCEAMALIQBACAAQAgAvhAAAIQBACAC8EAIAhADAjx//B5dJmJEF5LkZ\
AAAAAElFTkSuQmCC" alt="Tweaty" style="float:left">';

help_html = '<ul><li>To show a list of all users, just click the User Search button at the right.</li><li>Click your browser\'s Back button to go back to previous page(s).</li><li>To update your page or to remove red messages, click on Home at the top left<br />(or your browser\'s Refresh button).</li><li>Cookies and JavaScript must be enabled for some functions.</li><li>In a Boolean Search, at least the first term must be filled in.</li><li>Wildcards may be used in Hashtag Searches and Boolean Searches:<br /> ? for any one character, and * for any zero or more characters.</li><li>The Limit button at the right sets the number of Tweats shown and the number<br />of Search Results.</li><li>To turn on Chat Mode, click the green Start Chat button at the right.<br /> It will turn into a red Stop Chat button. In Chat Mode, the Tweats will be<br /> redisplayed every ten seconds, so any Tweats sent by someone<br /> you\'re following will appear automatically without having to click Home<br /> to reload the page. If the person you\'re following is also following you,<br /> and he\'s in Chat Mode, your new Tweats should appear automatically<br /> every ten seconds on his page as well, so you can have a real-time<br /> text conversation in Chat Mode. Actually, several people who are all following each other<br /> and are all in Chat Mode can have a multi-person conversation! In Chat Mode, any picture<br /> will be moved to the bottom of the page, and only the ten most recent Tweats are displayed.<br /> If you don\'t send a Tweat for five minutes, Chat Mode will be turned off automatically,<br /> and you would have to click Start Chat to restart it. Tweats sent in Chat Mode will be deleted<br /> automatically after 24 hours, so they can\'t have hashtags, and no email notifications<br /> are sent with these Tweats.</li><li>To post a picture by using a URL beginning with "http", type or paste it into the Tweat textbox,<br /> and then click the Pic button before pressing Enter.</li><li>To add a hashtag to a Tweat, just include the # sign followed by the hashtag,<br /> such as #popmusic (with no spaces between multiple words). Only one hashtag<br /> can be used in each Tweat, but you could post the same Tweat twice<br />with different hashtags, theoretically...</li></ul></body></html>';

upload_picture_html = heredoc(function() {/*
<!DOCTYPE html>
<HTML>
  <HEAD>
    <TITLE>Tweater Picture File Upload</TITLE>
    <STYLE>
      .center {
        margin-left: auto;
        margin-right: auto;
        width: 75%;
        background-color: #00DD00;
      }
    </STYLE>
  </HEAD>
  <BODY style="background-color:#c0c0f0;padding:8px;font-family:Courier New, Helvetica};">
    <DIV style="width:100%">
      <DIV class="center">
        <H1 class="center">Picture Upload:</H1>
      </DIV>
    </DIV>
    <DIV class="center">
    <img src="/users/tweatycamera.png" style="float:left;width:50%;height:50%" />
      <FORM action="/user/upload_picture_uploading" method="post" enctype="multipart/form-data">
        <H2>Select picture file to upload (only jpg, jpeg, gif and png image files are allowed, and the maximum file size is 1MB):</H2>
        <INPUT type="file" name="file" id="file" size="70">
        <INPUT type="submit" value="Upload Picture File" name="submit">
        <INPUT type="button" value="Cancel" onclick="window.close();">
      </FORM>
    </DIV>
  </BODY>
</HTML>
*/});

index_html = heredoc(function() {/*
<!DOCTYPE html>
<HTML>
  <HEAD>
    <TITLE>TWEATER</TITLE>
    <META NAME="description" CONTENT="Tweater Social Site"> 
    <META NAME="keywords" CONTENT="tweater, social site, tweats">
    <SCRIPT LANGUAGE="JavaScript">
    <!--
function openit() {
  if (navigator.appVersion.indexOf("Chrome") >= 0) {
    window.location.replace('home_chrome.html');
  } else if (navigator.appVersion.indexOf("(Windows ") >= 0) {
    window.location.replace('home_msie.html');
  } else if (navigator.appVersion.indexOf("5.0 (Windows)") >= 0) {
    window.location.replace('home_firefox.html');
  } else {
    window.location.replace('home_chrome.html');
  }
}
    //-->
    </SCRIPT>
  </HEAD>
  <BODY LINK="#C00000" VLINK="#800080" alink="#FFFF00" bgcolor="#99D9EA" onload="openit()">
    <h1><b style="font-size:20px;color:red;background-color:violet"><b>&nbsp;Tweater&nbsp;</b></h1>
    <h1 style='text-align:center'>
      <a href="home_chrome.html" onclick="openit()">If you're not redirected to Tweater in a few seconds, 
        please click here.</a>
    </h1>
    <img src="/users/tweaty.png" />
  </BODY>
</HTML>
*/});

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true, keepExtensions: true, uploadDir: __dirname + '/pictures' }));
app.use(busboy({ highWaterMark: 2 * 1024 * 1024, limits: { fileSize: 10 * 1024 * 1024 } })); 
app.use('/users', express.static('pictures')); // 2 static files paths, e.g. for images or CSS
//app.use('/users/tweat_delete/*.png', express.static('pictures'));
//app.use('/users/tweat_delete/*.jpg', express.static('pictures'));
app.use('/*', express.static('pictures'));

// Get all users
var client = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
client.query("USE " + DATABASE_NAME);
client.query("SET NAMES 'utf8'");
client.query("SELECT * FROM " + DATABASE_TABLE, function (err, results, fields) {
  if (err) {
    throw err;
  } else {
    users = results;
//console.log("All users:" + JSON.stringify(users));
    client.end();
  }
});

app.get('/', function(req, res) { // Sign-In or Register Page
console.log("sign/reg");
  cookies = new Cookies(req, res);
  if (cookies.get('user_name') && cookies.get('password')) {
console.log(cookies.get('user_name').replace("%40","@"));
console.log(cookies.get('password'));
    var given_user_name = cookies.get('user_name').replace("%40","@");
    password = cookies.get('password').replace("%40","@");
    ret = '_chrome'; // Chrome browser version
    title_position = "right: -77px;";
    sign_in_width = "width:506px;";
    margin_left = "margin-left: -43px;";
    interests_position = "left:3px;";
    interests_width = "width:310px;position:relative;top:2px";

    main_init(req); // Initialize main variables and also data from cookies
    password_hash = crypto.createHmac("MD5", CRYPT_SALT).update(password).digest("base64");
    user = _.find(users, function(u) {
      return u.user_name == given_user_name;
    });
    if ((user) && (password_hash == user.password_hash)) {
      stay_logged_in = cookies.get('stay_logged_in');
      status = user.admin_status;
      user_name = user.user_name;
      name = user.name;
      if (stay_logged_in == "on") {
// Set cookies to remain signed in.
        res.cookie('user_name', user_name, {expires: new Date(Date.now() + 86400 * 365 * 67)});
        res.cookie('password', password, {expires: new Date(Date.now() + 86400 * 365 * 67)});
      } else {
// Set session cookies
        res.cookie('user_name', user_name);
        res.cookie('password', password);
      }
      id = user.id;
      picture_ext = user.picture_ext;
      if (picture_ext) {
        picture_url = id + "." + picture_ext;
      } else {
        picture_url = "nophoto.jpg";
      }
      interests = user.interests;
      interests_words = user.interests_words;
      email = user.email;
      tweat_notify = user.tweat_notify;
      res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8' });
      show_home_page(req, res);
      return;
    }
  }
  message = "";
  sign_in_or_register(req, res, "");
});

app.get('/error', function(req, res) { // Sign-In or Register error message
console.log("sign/reg");
  message = req.param("message");
  if (message) {
    message = message.replace(/\+/g, " ");
  }
console.log("sign/reg error: " + message);
  sign_in_or_register(req, res, message);
});

app.get('/users', function(req, res) {
  res.send({ success: true, users: users});
  var us = new Buffer(JSON.stringify(users), 'ascii').toString('utf8');
  res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8' });
  res.end("<!DOCTYPE html><html><head><meta http-equiv=Content-Type content='text/html; charset=UTF-8' /><title>Users Test!!</title></head><body>aÃ±o.<br />"+us+"</body></html>");
console.log("success: true");
console.log("users:" + us);
});

app.get('/user/delete_tweat/:tid', function(req, res) {
  tid = req.params.tid;
console.log("delete_tweat:" + tid);
  delete_tweat(req, res);
  message = "";
  return;
});

app.get('/user/help', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8' });
  res.end('<!DOCTYPE html><html><head><title>Tweater Help</title><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css"><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css"><script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script><body style="background-color:#99D9EA;font-size:' + font_size + 'px"><div><a href="' + SELF_NAME + '" style="font-size:' + 
bigfont + 'px;color:red;background-color:#990099"><b>&nbsp;Tweater Help&nbsp;</b></a></div><img src="/users/tweatyquestion.png" style="float:right" />' + help_html);
});

app.get('/users/:user_name', function(req, res) {
  user_name = req.params.user_name.toLowerCase().trim().replace(/\+/g, " ").replace(/\s+/g, " ").replace(/%40/g, "@").replace(/%2B/g, "+");

  user = _.find(users, function(u) {
    return u.user_name == user_name;
  });

  if (user) { // Signing-in user found
// *** try db sign in w/ pw here
    if (picture_ext.length < 1) {
      picture_url = "nophoto.jpg";
    } else {
      picture_url = id + "." + picture_ext;
    }

    res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8' });
    show_home_page(req, res);
  }
  /* result = user
    ? { success: true, user: user}
    : { success: false, reason: 'user not found: ' + user_name};
  var tw = new Buffer(JSON.stringify(users)+JSON.stringify(tweats), 'ascii').toString('utf8');
  res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8' });
  res.end("<!DOCTYPE html><html><head><meta http-equiv=Content-Type content='text/html; charset=UTF-8' /><title>Test!!</title></head><body>aÃ±o.<br />"+tw+"</body></html>");
console.log("success:" + result.success);
console.log("reason:" + result.reason);
console.log("aÃ±o."+tweats[22].tweat); */
});

app.get('/users/view_user_name/:user_name', function(req, res) {
  user_name = req.params.user_name.toLowerCase().trim().replace(/\+/g, " ").replace(/\s+/g, " ").replace(/%40/g, "@").replace(/%2B/g, "+");
console.log("view_user_name:" + user_name);
});

app.get('/user/upload_picture', function(req, res) {
console.log("upload");
  res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8' });
  res.end(upload_picture_html);
  return;
});

app.post('/user/upload_picture_uploading', function(req, res) {
  upload_picture_uploading(req, res);
});

app.post('/user/post_tweat', function(req, res) {
  var tweat_post = req.body;
  tweat = tweat_post.tweat;

//Post new Tweat to database
  if (tweat) {
console.log('Tweat fd: ', tweat);
    post_tweat(req, res);
  }
  message = "";
  return;
});

app.post('/user/signin', function(req, res) {
  var given_user = req.body;
console.log("user:", JSON.stringify(given_user));
  given_user.user_name = given_user.user_name.trim().toLowerCase().replace(/\s+/g, " ").replace("%40","@");
  message = "";
  forgot_password = given_user.forgot_password;
// Forgotten password, so email password reset code if email address exists or username appears to be email
  if (forgot_password == "on") {
console.log("forgot pw");
    user_name = given_user.user_name;
    password_forgotten(res);
    return;
  }
  if (!given_user.user_name || !given_user.password) {
    console.log("success: false");
    console.log("reason: Missing password or username.");
    message += "Error: Both the password and username are required. "
  }
  user_name = given_user.user_name;
  password = given_user.password.replace("%40","@");
  password_hash = crypto.createHmac("MD5", CRYPT_SALT).update(password).digest("base64");
  user = _.find(users, function(u) {
    return u.user_name == given_user.user_name;
  });

  if (!user) { // Signing-in user not found
    message += 'Error: "' + given_user.user_name + '" was not found in ' + DATABASE_TABLE + ' with the password given. ';
  } else {
    if (password_hash != user.password_hash) {
      message += "Error: The password is not correct. You may try again. ";
      if (password.toLowerCase() != password) {
        message += "Note: Make sure your caps lock isn't on by accident, since passwords are case sensitive. ";
      }
    }
  }
  if (message) {
    sign_in_or_register(req, res, message);
    return;
  }
// Successful sign-in
  stay_logged_in = given_user.stay_logged_in;
  status = user.admin_status;
  name = user.name;
  cookies = new Cookies(req, res);
  if (stay_logged_in == "on") {
// Set cookies to remain signed in.
    var date = new Date();
    date.setTime(date.getTime() + (86400 * 365 * 67));
    cookies.set('user_name', user_name, date); // Set cookies to be deleted
    cookies.set('password', password, date);
  } else {
// Set session cookies
  cookies.set('user_name', user_name, 0);
  cookies.set('password', password, 0);
  }
  id = user.id;
  picture_ext = user.picture_ext;
  if (picture_ext) {
    picture_url = id + "." + picture_ext;
  } else {
    picture_url = "nophoto.jpg";
  }
  interests = user.interests;
  interests_words = user.interests_words;
  email = user.email;
  tweat_notify = user.tweat_notify;
  res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8' });
  show_home_page(req, res);
  return;
});

app.post('/user/new', function(req, res) {
  var user = req.body;
console.log("user:", JSON.stringify(user));
// *** Add only A-Z a-z 0-9 ' _ - . @ only chars allowed in un
  user.user_name = user.user_name.trim().toLowerCase().replace(/\s+/g, " ");
  user.name = user.name.trim().replace(/\s+/g, " ");
  message = "";
console.log("given new un:" + user.user_name);
  if (!user.user_name || !user.name) {
    console.log("success: false");
    console.log("reason: Missing name or username.");
    message += "Error: Both the name and username are required. "
  }
  var existing = _.findWhere(users, {user_name: user.user_name}); 
  if (existing) {
    console.log("success: false");
    console.log("reason: The username \"" + user.user_name + "\" already exists. Please choose another username.");
    message += "Error: The username \"" + user.user_name + "\" already exists. Please choose another username. "
  }
  if (user.new_user_password.length < 6) {
    console.log("success: false");
    console.log("reason: The password length must be at least six characters.");
    message += "Error: The password must have at least six characters. "
  }
  if (user.new_user_password != user.password_confirm) {
    console.log("success: false");
    console.log("reason: The password confirmation doesn't match the password.");
    message += "Error: The password confirmation doesn't match the password. "
  }
  if (parseInt(user.answer_added.trim()) != parseInt(user.given_added.trim())) {
    console.log("success: false");
    console.log("reason: The answer to the math question was incorrect. You may try again with a new question below.");
    message += "Error: The answer to the math question was incorrect. You may try again with a new question below. "
  }
  if (message) { // Registration Failure
//console.log("loc:" + message);
    sign_in_or_register(req, res, message);
    return;
  }

// Registration Success
// Set new user id to highest existing id + 1, and add new user
  users.sort(function(a,b) {return a-b});
  user.id = users[users.length - 1].id + 1;

  email = user.email.trim();
  if ((email.length != 0) && (email.indexOf("@") > 0)) {
    tweat_notify = 1; // Email address given, so enable Tweat notifications.
  } else {
    email = null;
    tweat_notify = 0;// No email address given, so disable Tweat notifications.
  }
  users.push(user);
  user_name = user.user_name;
  name = user.name.trim().replace(/\+/g, " ").replace(/\s+/g, " ").replace(/%2B/g, "+");
  password = user.new_user_password.replace("%40","@");
  password_hash = crypto.createHmac("MD5", CRYPT_SALT).update(password).digest("base64");
  cookies = new Cookies(req, res);
  cookies.set('user_name', user_name, 0);
  cookies.set('password', password, 0);
  interests_words = "  " + user_name.trim().toLowerCase() + " " + name.trim().toLowerCase() + " ";
  picture_ext = null;
  picture_url = "nophoto.jpg";
  var client3 = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
  client3.query("USE " + DATABASE_NAME);
  client3.query("SET NAMES 'utf8'");
  client3.query("INSERT INTO " + DATABASE_TABLE + " (user_name, password_hash, name, " + 
    "interests, interests_words, tweat_notify, email, picture_ext, password_reset_hash) values(?,?,?,NULL,?,?,?,NULL,NULL)", [user_name, password_hash, name, interests_words, tweat_notify, email], function (err3, results3, fields3) {
    if (err3) {
      throw err3;
    } else {
      client3.end();
console.log("New user: " + user_name);
      var client4 = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
      client4.query("USE " + DATABASE_NAME);
      client4.query("SET NAMES 'utf8'");
      client4.query("INSERT INTO followed_ones (id, user_name, followed_one) VALUES (NULL, ?, ?), " + 
        "(NULL, 'crandadk@aol.com', ?)", [user_name, user_name, user_name], function (err4, results4, fields4) {
        if (err4) {
          throw err4;
        } else {
          client4.end();
          var client5 = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
          client5.query("USE " + DATABASE_NAME);
          client5.query("SET NAMES 'utf8'");
          interests_array = interests_words.split(" ");
          interests_array = interests_array.filter(function(item, i, ar){return ar.indexOf(item) === i;});
          for (var item = 0; item < interests_array.length; item++) {
            client5.query("INSERT INTO interests (id, user_name, interest) values(NULL, ?,?)", [user_name, interests_array[item] ], function (err5, results5, fields5) {
              if (err5) {
                throw err5;
              }
            });
          }
          client5.end();
// Set session cookies
          res.cookie('user_name', user_name); //551
          res.cookie('password', password);
          res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8' });
          //res.cookie('user_name', user_name, {expires: new Date(Date.now() + 86400 * 365 * 67)});
          //res.cookie('password', password, {expires: new Date(Date.now() + 86400 * 365 * 67)});
          show_home_page(req, res);
        }
      });
    }
  });
  return;
});

app.get('/:what', function(req, res) { // 404 Page not found
  page_not_found_404(res);
});

app.get('/[^up].*', function(req, res) { // 404 Page not found
  page_not_found_404(res);
});

app.get('/user/:what', function(req, res) { // 404 Page not found
  page_not_found_404(res);
});

app.get('/users/:what', function(req, res) { // 404 Page not found
  page_not_found_404(res);
});

app.get('/pictures/:what', function(req, res) { // 404 Page not found
  page_not_found_404(res);
});

app.listen(port);

function start(route) {

  function onRequest(req, res) {
/**
 * Process page requests from client.
 * @param {string} req Request from client to server.
 * @param {string} res Response from server to client.
 */
   var request = url.parse(req.url, true); 
   var action = request.pathname;
   query = request.query;
   cookies = new Cookies(req, res);

// get a cookie value:
// c = cookies.get('user_name');
// set a cookie value:
// cookies.set('user_name', 'john'); // line 200
console.log("action:" + action);

   try {
    if (action.substring(action.length - 4) == '.png') { 
      var img = fs.readFileSync(MY_PATH + action); 
      res.writeHead(200, {'Content-Type': 'image/png' }); 
      res.end(img, 'binary');
    } else if (action.substring(action.length - 4) == '.jpg') { 
      var img = fs.readFileSync(MY_PATH + action); 
      res.writeHead(200, {'Content-Type': 'image/jpg' }); 
      res.end(img, 'binary');
    } else if (action.substring(action.length - 5) == '.jpeg') { 
      var img = fs.readFileSync(MY_PATH + action); 
      res.writeHead(200, {'Content-Type': 'image/jpeg' }); 
      res.end(img, 'binary');
    } else if (action.substring(action.length - 4) == '.gif') { 
      var img = fs.readFileSync(MY_PATH + action); 
      res.writeHead(200, {'Content-Type': 'image/gif' }); 
      res.end(img, 'binary');
    } else if (action.substring(action.length - 3) == '.js') { 
      var js = fs.readFileSync(MY_PATH + action); 
      res.writeHead(200, {'Content-Type': 'application/javascript' }); 
      res.end(js);
    } else if (action.substring(action.length - 4) == '.css') { 
      var css = fs.readFileSync(MY_PATH + action); 
      res.writeHead(200, {'Content-Type': 'text/css' }); 
      res.end(css);
    } else if ((action == '/') || (action == '') || (action == '/index.html')) {
      res.writeHead(200, {'Content-Type': 'text/html' });
      res.end(index_html);
    } else if (action == '/help.html') {
      res.writeHead(200, {'Content-Type': 'text/html' });
      res.end(help_html_setup());
    } else if (action == '/home_msie.html') {
      ret = '_msie'; // Internet Explorer browser version
      title_position = "right: -153px;";
      sign_in_width = "";
      margin_left = "margin-left: -53px;";
      interests_position = "left:2px;";
      interests_width = "";

      main_init(); // Initialize main variables and also data from cookies

    } else if (action == '/home_firefox.html') {
      ret = '_firefox'; // Firefox browser version
      title_position = "right: -77px;";
      sign_in_width = "width:506px;";
      margin_left = "margin-left: -43px;";
      interests_position = "left:3px;";
      interests_width = "width:310px;position:relative;top:2px";

      main_init(); // Initialize main variables and also data from cookies

    } else if (action == '/home_chrome.html') {
console.log("headers:" + req.headers);
/*if (!undefined) {console.log("undefined is false");}
if (!null) {console.log("null is false");}
if (!"") {console.log("empty string \"\" is false");}
if (!0) {console.log("Number 0 is false");}
if ("0") {console.log("String \"0\" is true");}
if ("false") {console.log("String \"false\" is true");}
if (!"false") {console.log("String \"false\" is false");}
if ([]) {console.log("empty array is true");}
if ([0]) {console.log("array [0] is true");}
if ([null]) {console.log("array [null] is true");}
if ([undefined]) {console.log("array [undefined] is true");}
if ({}) {console.log("empty object {} is true");}
if ({x:0}) {console.log("object {x:0} is true");}
if ({x:null}) {console.log("object {x:null} is true");}
if ({x:undefined}) {console.log("object {x:undefined} is true");}*/
      ret = '_chrome'; // Chrome browser version of Home page
      title_position = "right: -77px;";
      sign_in_width = "width:506px;";
      margin_left = "margin-left: -43px;";
      interests_position = "left:3px;";
      interests_width = "width:310px;position:relative;top:2px";

      main_init(); // Initialize main variables and also data from cookies

      //var date = new Date();
      //date.setTime(date.getTime() + (86400 * 365 * 67));
var date = new Date();
console.log(SELF_NAME);

// Process unsubscribe request
      if ((cookies.get('unsub')) && (cookies.get('user_name')) && (cookies.get('password'))) {
        res.writeHead(200, {'Content-Type': 'text/html' });
console.log("unsub");
        unsubscribe_processing();
      }

// Get automatic signin data with username and password stored in cookies
      if (true) {//((cookies.get('user_name')) && (cookies.get('password')) && (cookies.get('password') != '')) {
console.log("sign in auto");

        sign_in_auto_get_credentials();
      }

console.log('http://' + req.headers.host + req.url);
//parsedURL = url.parse('http://' + req.headers.host +  req.url, true);

      if ((req.method === "GET") && (req.url.indexOf("?") > 0)) { // GET data is in URL querystring
console.log("GET recvd");

// Change Tweat Email Notifications preference
        if (query['notify']) {
console.log("notify chgd");
          change_email_notify();
        }

// Change Email Address
        if (query['new_email_address']) {
console.log("email adr chgd");
          change_email_address();
        }

// Delete Tweat
        if (query['delete_tweat']) {
          delete_tweat(res); // 370
          return;
        }

      } else if (req.method !== "POST") { // Data is in COOKIES
console.log("Non-POST recvd");

          //res.end('<html><body>' + message + '<form action="' + SELF_NAME + '" method="GET"><input type="text" name="delete_tweat"><input type="submit" value="send"></form></body></html>');
      }
      
      if (req.method === "POST") {// Data is POST data
console.log("POST recvd");
        post_body = "";
        req.on('data', function handlePost(postchunk) { // Accumulate POST data // line 300
          post_body += postchunk;
        });

        req.on("end", function() { // Process POST data
console.log("post_body:", post_body);
  //console.log("post_body un:", get_post("user_name"));

          forgot_password = get_post('forgot_password');
//user_name = "crandadk@aol.com"; // --*** test unm

  // Forgotten password, so email password reset code if email address exists or username appears to be email
          if (forgot_password == "on") {
            //res.writeHead(200, {'Content-Type': 'text/html' });
console.log("forgot pw");
            password_forgotten(res);
            return;

          } else {
// Get manual POST signin data
            //sign_in_manual_get_credentials();
          }

          tweat = get_post('tweat');

  //Post new Tweat to database
          if (tweat) {
  console.log('post_body : ', post_body);
  console.log('Tweat fd2: ', tweat);

//get_post('name').replace("+", " ");
            post_tweat(req, res);
            return;

          } else {
// Sign in
/*// Set user cookies
            if (stay_logged_in == "on") {
              var date = new Date();
              date.setTime(date.getTime() + (86400 * 365 * 67));
              cookies.set('user_name', user_name, date); // Set cookies to be deleted
              cookies.set('password', password, date);
console.log('Setting stay-signed-in cookie');
            } else {
//console.log('setting signin cookies for: ', user_name);
              //cookies.set('user_name', user_name, 0);
              //cookies.set('password', password, 0);
            }*/

// Write main response header
console.log('main');
            res.writeHead(200, {'Content-Type': 'text/html' });
            sign_in_to_account(req, res);

/*res.end('<html><body><form method="POST"><input type="text" name="user_name"><input type="password" name="password"><input type="text" name="tweat"><input type="submit" value="send"></form></body></html>');*/
          }
  console.log("message: ", message);    
        }); //
      }
      //return;

// Sign in
// Set user cookies
      if (stay_logged_in == "on") { // 440
        var date = new Date();
        date.setTime(date.getTime() + (86400 * 365 *67));
        cookies.set('user_name', user_name, date); // Set cookies to be deleted
        cookies.set('password', password, date);
console.log('Setting stay-signed-in cookie!');
      } else {
//console.log('setting signin cookies for: ', user_name);
        //cookies.set('user_name', user_name, 0);
        //cookies.set('password', password, 0);
      }

// Write main response header
      res.writeHead(200, {'Content-Type': 'text/html' });
      sign_in_to_account(req, res);

// Process password reset
    } else if (action == '/forgot_password.html') {
      password_reset(req, res);

    } else {

// Display 404 Error: Page not found
console.log("404");
      page_not_found_404(res);
    }
   } catch(e) {
console.log("404!");
     page_not_found_404(res);
   }
  }
  //http.createServer(onRequest).listen(8888);
  console.log("Server has started.");
}
          
function get_post(var_name) { //793
/**
 * Get variables from Post request.
 * @param {string} var_name Name of posted variable.
 * @returns {string} value of posted variable <var-name>.
 */
  var patt = new RegExp(var_name + "=([^&]*)");
  var post = patt.exec(post_body);
  if (post) {
    return post[1];
  }
  return undefined;
}

/* Not needed: function get_query(var_name) {
/-**
 * Get variables from Get request querystring.
 * @param {string} var_name Name of querystring variable.
 * @returns {string} value of querystring variable <var-name>.
 *-/
  return parsedURL['query'][var_name];
}*/

function strtran(str, oldchars, newchars) {
/**
 * Translate given characters to other characters.
 * @param {string} str String to translate.
 * @param {string} oldchars List of characters to translate from.
 * @param {string} newchars List of characters to translate to. If longer than oldchars, extra characters are ignored.
 * @returns {string} with characters translated.
 */
  var newstr = "";
  for (var i = 0; i < str.length; i++) {
    newstr += (oldchars.indexOf(str.charAt(i)) == -1 ? str.charAt(i) : newchars.charAt(oldchars.indexOf(str.charAt(i))));
  }
  return newstr;
}

function wordwrap(str, width, brk, cut) {
/**
 * Format <tt>str</tt> for line length, break marker and long word division.
 * @param {string} str String to be formatted.
 * @param {number} [width=75] Maximum line width before wrapping to next line.
 * @param {string} [brk="\n"] String to insert to indicate line break before wrapping to next line, e.g. "\n".
 * @param {boolean} [cut=false] If true, break up any word onto multiple lines which is longer than <tt>width</tt>.
 * @returns {string} formatted string.
 */
  brk = brk || '\n';
  width = width || 75;
  cut = cut || false;
  if (!str) {
    return str;
  }
  var regex = '.{1,' + width + '}(\\s|$)' + (cut ? '|.{' + width + '}|.+$' : '|\\S+?(\\s|$)');
  return str.match(RegExp(regex, 'g')).join(brk);
}

function get_home_page(req, res) {
/**
 * Get home page HTML.
 * @returns {string} signed-in user's home page HTML.
 */
/* Separate this interests section: // Update information and interests
  interests = "";
  row_interests = user['interests'];
console.log("row_interests=", row_interests );
  if (query['interests']) {
    interests = query['interests'];
console.log("get_interests=", interests );
    if (interests == "") {
      interests_names = "  " + user_name + " " + name + " ";
      var client = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
      client.query("USE " + DATABASE_NAME);
      client.query("UPDATE " + DATABASE_TABLE + " SET interests = NULL, interests_words = ? " + 
        "WHERE ((user_name = ?) OR (email = ?)) AND (binary password_hash = ?)", [interests_names, user_name, user_name, password_hash], function (err, results, fields) {
        if (err) {
          //client.end();
          throw err;
        } else {
          var client2 = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
          client2.query("USE " + DATABASE_NAME);
          client2.query("DELETE FROM interests WHERE user_name = ? AND ? NOT LIKE CONCAT('% ', interest, ' %')", [user_name, interests_names], function (err2, results2, fields2) {
            client2.end();
            if (err2) {
              throw err2;
            }
          });
        }
      });
    } else {
      if (row_interests != interests) { //595
        var client = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
        client.query("USE " + DATABASE_NAME);
        try {
          var result = utf8.decode(interests);
//console.log('a valid utf8 (from ', interests, '): ', result);
          client.query("SET NAMES 'utf8'");
        } catch (e) {
          if (interests) {
//console.log('Invalid UTF-8 (', interests, '): ', e);
          }
        }
        client.query("UPDATE " + DATABASE_TABLE + " SET interests = ? " + 
          "WHERE ((user_name = ?) OR (email = ?)) AND (binary password_hash = ?)", [interests, user_name, user_name, password_hash], function (err, results, fields) {
          if (err) {
            throw err;
          } else {
            //client.end();
            var client2 = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
            client2.query("USE " + DATABASE_NAME);
            client2.query("SELECT * FROM " + DATABASE_TABLE + 
              " WHERE ((user_name = ?) OR (email = ?)) AND (binary password_hash = ?)", [user_name, user_name, password_hash], function (err2, results2, fields2) {
              if (err2) { // 617
                throw err2;
              }
              user_rows = results2;
              interests = user_rows[0]['interests'];
              name = user_rows[0]['name'];
              if (user_name == user_rows[0]['email']) {
                user_name = user_rows[0]['user_name'];
              }
              client2.end();
// Build list of old interests for deleting and list of new interests for adding
              old_interests = row_interests.toLowerCase().substr(0, 250).replace("-", " ");
              old_interests = strtran(old_interests, '!"#%&()*+,-./:;<=>?[\]^_`{|}~' + 
              '¡¦©«¬­®¯´¶¸»¿', '                                                  ' + 
              '                                       ').trim();
          
              new_interests = interests.toLowerCase().substr(0, 250).replace("-", " ");
              new_interests = strtran(new_interests, '!"#%&()*+,-./:;<=>?[\]^_`{|}~' + 
              '¡¦©«¬­®¯´¶¸»¿', '                                                  ' + 
              '                                       ').trim();
          
              old_interests = old_interests.replace("   ", " ");
              old_interests = old_interests.replace("  ", " ");
              
              if (!old_interests) {
                old_interests = " ";
              }
              if (!new_interests) {
                new_interests = " ";
              }
              
              new_interests = new_interests.replace("   ", " ");
              new_interests = new_interests.replace("  ", " ");
              
          // Add username and name to lists of interests
              old_interests = user_name.toLowerCase() + " " + name.toLowerCase() + " " + old_interests;
              new_interests = user_name.toLowerCase() + " " + name.toLowerCase() + " " + new_interests;
          
          // Create arrays of unique words from interests
              old_interests_array = old_interests.split(" ");
              old_interests_array = old_interests_array.filter(function(item, i, ar){return ar.indexOf(item) === i;});
              new_interests_array = new_interests.split(" ");
              new_interests_array = new_interests_array.filter(function(item, i, ar){return ar.indexOf(item) === i;});
              old_interests = "  " + old_interests + " ";
              new_interests = "  " + new_interests + " ";

              var client3 = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
              client3.query("USE " + DATABASE_NAME);

              try { // 667
                var result = utf8.decode(old_interests);
      //console.log('a valid utf8 (from ', old_interests, '): ', result);
                client3.query("SET NAMES 'utf8'");
              } catch (e) {
                if (old_interests) {
console.log('Invalid UTF-8 (', old_interests, '): ', e);
                }
              }
      
              try {
                var result = utf8.decode(new_interests);
      //console.log('a valid utf8 (from ', new_interests, '): ', result);
                client3.query("SET NAMES 'utf8'");
              } catch (e) {
                if (new_interests) {
console.log('Invalid UTF-8 (', new_interests, '): ', e);
                }
              }

              client3.query("UPDATE " + DATABASE_TABLE + " SET interests_words = ? " + 
                "WHERE ((user_name = ?) OR (email = ?)) AND (binary password_hash = ?)", [new_interests, user_name, user_name, password_hash], function (err3, results3, fields3) {
                if (err3) {
                  throw err3;
                }
                client3.end();

// Add new updated interests to database
                var client4 = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
                client4.query("USE " + DATABASE_NAME);
console.log('new_interests_array:', new_interests_array);
                for (var new_item = 0; new_item < new_interests_array.length; new_item++) {
                  if ((new_interests_array[new_item].length > 0) && (old_interests.indexOf(" " + new_item + " ") == -1)) {
console.log('Interests updated:', new_interests_array[new_item]);

                    client4.query("INSERT INTO interests (id, user_name, interest) values(NULL, ?,?)", [user_name, new_interests_array[new_item] ], function (err4, results4, fields4) { // 700
                      if (err4) {
                        throw err4;
                      } else {
                      }
                    });
                  }
                }
                client4.end(); // del if causes err

// Delete old obsolete interests from database
                var client5 = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
                client5.query("USE " + DATABASE_NAME);

                for (var old_item = 0; old_item < old_interests_array.length; old_item++) {
                  if ((old_interests_array[old_item].length > 0) && (new_interests.indexOf(" " + old_item + " ") == -1)) {
                    client5.query("DELETE FROM interests WHERE user_name = ? AND interest = ?", [user_name, old_interests_array[old_item] ], function (err5, results5, fields5) {
                      if (err5) {
                        throw err5;
                      }
                    });
                  }
                }
                client5.end(); // del if causes err
              });
            });
          }
        });
      }
    }
  } else {
    interests = row_interests; // No update of interests
  }
  if (interests == "    ") {
    interests = "";
  }
  if (!interests) {
    interests = "";
  } */

  main_init(req); // Initialize user header HTML and user variables from cookies

  if (font_size == FONTSIZE) { // Adjust input width by font size
    input_width = 113;
  } else {
    input_width = Math.floor(2000 / font_size);
  }
  bigfont = font_size * 1.5;

// Enable/disable image adjustment
  if (!picture_ext) {
    disable_photo_adjust = "disabled";
  } else {
    disable_photo_adjust = "";
  }

// Get followers count
  var client6 = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
  client6.query("USE " + DATABASE_NAME);
  client6.query("SELECT COUNT(DISTINCT user_name) AS followers_count FROM followed_ones " + 
    "WHERE followed_one = ?", [user_name], function (err6, results6, fields6) {
    if (err6) {
      //client6.end();
      throw err6;
    }
    var myrow4 = results6;
    followers_count = myrow4[0]['followers_count'] - 2 || 0;
    client6.end();
  });

// List followed users with links to their pages
  var client = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
  client.query("USE " + DATABASE_NAME);
  client.query("SET NAMES 'utf8'");
  client.query("SELECT DISTINCT u.name, u.id, f.followed_one FROM followed_ones AS f " + 
    "INNER JOIN users AS u ON f.followed_one = u.user_name WHERE f.followed_one IN " + 
    "(SELECT f.followed_one FROM followed_ones AS f WHERE f.user_name = ?) ORDER BY name", [user_name], function (err, results, fields) {
    if (err) {
      //client.end();
      throw err;
    } else {
      followed_ones_list = "";
      if (results) {
        for (var myrow3 = 0; myrow3 < results.length; myrow3++) {
          if (results[myrow3]['followed_one'] != user_name) {
            followed_ones_list += "<option value='" + results[myrow3]['followed_one'] + "'>" + 
              wordwrap(results[myrow3]['name'], 30, '<br />', true) + " (" + 
              wordwrap(results[myrow3]['followed_one'], 30, '<br />', true) + ")</option>";
          }
        }
      }
      //client.end();
    }
//Left off here:
//console.log(followed_ones_list);
  });

  esc_name = name.replace(" ", "+"); // Version of user's name with space(s) changed to + for GET querystring
console.log("chat:" + chat);
// Adjust Chat Mode start/stop button and its action
  if (chat == 'true') {
    chat_button = 'danger';
    chat_button_action = 'Stop';
    chat_toggle = 'false';
  } else {
    chat_button = 'success';
    chat_button_action = 'Start';
    chat_toggle = 'true';
  }

  status="";
  unsubscribe_password = crypto.createHmac("MD5", CRYPT_SALT).update(password).digest("base64");
  if (message) {
    formatted_message = '<div class="container" style="position:relative;top:-20px;margin:0px;padding:0px;' + 
    'height:' + parseInt(font_size * 0.5) + 'px;font-size:' + bigfont + 'px;color:red">' + message + 
    '</div><br />';
  } else {
    formatted_message = "";
  }
  message = "";
  if (stay_logged_in == "on") {
    var staylogged = 'staySignedIn();';
  } else {
    var staylogged  = "";
  }
// Left off here

// Prepare Tweats Display
  tweat_list = "";
  if (chat == 'true') {

// Display Tweats as Chat in iframe
    name = name.replace(" ", "+");
    tweat_list += "<iframe id='tweats_iframe' src='get_tweats.html?name=" + name + "&return=" + ret + 
"' style='width:1250px;height:590px;position:absolute;" + 
      "left:0px'><p>Your browser doesn't support iframes!</p></iframe>" + 
"<p style='position:relative;left:20px;top:590px'><i>Note:&nbsp;&nbsp;The creator of this website " + 
        "doesn't assume responsibility for its usage by others.</i></p>" + 
"<br /><img id='picture' src='/users/" + picture_url + "' style='position:relative;top:570px' />" + 
"<p style='position:relative;top:590px'>&nbsp;</p>";
  } else {
console.log("non-chat");

// Display Tweats as non-Chat without iframe
    tweat_list += "<div id='pic_top' style='position:relative;left:7px;top:-12px'><img id='top' " + 
"src='/users/transparent.gif' onload='startPic();' /><img id='picture' src='/users/" + picture_url + "\' />" + 
"</div></div></div>";

// Get Tweats from followed users and signed-in user for non-Chat Mode
console.log("lim:" + shown_limit);
    var client = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
    client.query("USE " + DATABASE_NAME);
    client.query("SET NAMES 'utf8'");
    client.query("SELECT t.id, t.user_name, t.tweat, t.hashtag, u.name FROM tweats AS t INNER JOIN " + 
      "users AS u ON t.user_name = u.user_name WHERE t.user_name IN " + 
      "(SELECT followed_one FROM followed_ones AS f WHERE f.user_name = ?) ORDER BY t.id DESC LIMIT ?", [user_name, parseInt(shown_limit)], function (err, results, fields) {
      if (err) {
        //client.end();
        throw err;
      }
      if (results) {
        for (myrow in results) {
          if (results[myrow]['name']) {
            myrow_name = results[myrow]['name'];
            myrow_tweat = results[myrow]['tweat'];
            tid = results[myrow]['id'];
            myrow_hashtag = results[myrow]['hashtag'] || "   ";
          } else {
            myrow_name = "";
            myrow_tweat = "";
            myrow_hashtag = "";
          }
          if (myrow_hashtag.substr(0, 3) == "DEL") {
    
  // Delete old chat tweat
            var date = new Date();
            if (date.getTime() > myrow_hashtag.substr(3)) {
              var client2 = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
              client2.query("USE " + DATABASE_NAME);
              client2.query("DELETE FROM tweats WHERE id = ?", [tid], function (err2, results2, fields2) {
                client2.end();
                if (err2) {
                  throw err2;
                }
              });
              continue;
            }
          }
//console.log(myrow_name + ": " + myrow_tweat);

          tweat_list += "<div class='row' style='color:black'><div class='col-md-3 text-right' " + 
            "style='word-wrap: break-word; margin-right: 1em; position:relative; left:46px'><b>" + 
            wordwrap(myrow_name, 40, '<br />', true) + 
            "</b>:</div><div class='col-md-9' style='margin-left: -2em; position:relative; left:46px'><p>" + 
            wordwrap(myrow_tweat, tweat_width, '<br />', true);
          if (myrow_name == name) { // 892
            no_quote_tweat = myrow_tweat.substr(0,80).replace('"', ' ');
            no_quote_tweat = no_quote_tweat.replace(/'/g, "&apos;");
            no_quote_tweat = no_quote_tweat.replace(/"/g, "&apos;&apos;");
            no_quote_tweat = no_quote_tweat.replace(/\t/g, " ");
            no_quote_tweat = no_quote_tweat.replace(/\n/g, " ");
            no_quote_tweat = no_quote_tweat.replace(/\r/g, " ");
            no_quote_tweat = no_quote_tweat.replace(/\f/g, " ");
            no_quote_tweat = no_quote_tweat.replace(/</g, "&lt;");
            no_quote_tweat = no_quote_tweat.replace(/>/g, "&gt;");

  // X button to delete Tweat
            tweat_list += "&nbsp;&nbsp;<img src='/users/xdel.png' style='position:relative;top:-1px' onclick='if " + 
  "(confirm(\"Are you sure you want to delete this Tweat?:  " + no_quote_tweat + 
"...\")) {location.replace(\"/user/delete_tweat/" + tid + "\");}' />";
          }
          tweat_list += "</p></div></div>";
        }
      }
      //client.end();
      tweat_list += "</div>";
      if (message != "") {
          message = '<div class="row" style="height:30px;position:relative;top:-22px;left:-40px;' + 
            'padding:0px;margin:0px;font-size:' + bigfont + 'px;color:red">' + message.trim() + '</div>';
      }

  // Disclaimer    
      tweat_list += "<div style='text-align:center'><br /><i>Note:&nbsp;&nbsp;The creator of this website " + 
        "doesn't assume responsibility for its usage by others.</i><br /><br />" + 
        "<div class='row' style='color:black'><div class='col-md-3 text-right'>" + 
        "<div id='pic_bottom' style='position:absolute;left:7px'>" + 
        "<img id='bottom' src='/users/transparent.gif' />" + 
        "</div></div><div class='col-md-9'></div></div>";
      tweat_list = tweat_list.replace(/%20/g, " ");
      tweat_list = tweat_list.replace(/%3D/g, "=");
      tweat_list = tweat_list.replace(/%26/g, "&");
      if (stay_logged_in == "on") {
        staySignedIn = "staySignedIn();\n\n";
      } else {
        staySignedIn = "";
      }
      //var decoded_tweat_list = new Buffer(JSON.stringify(tweat_list), 'ascii').toString('utf8');
      var decoded_tweat_list = tweat_list.replace(/\\"/g, '"').replace(/\\'/g, "'");
//res.write("<!DOCTYPE html><html><head>zip</head><body>" + tweat_list + "hr</body></html>");

// Get icon, Bootstrap, Angular and jQuery
      res.write('<!DOCTYPE html><html><head><meta charset="utf-8" />' + 
'  <title>' + name + '&apos;s Tweater Page (Username: ' + user_name + ')</title>' + 
'    <link rel="shortcut icon" href="/users/favicon.png" type="image/png">' + 
'    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">' + 
'    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">' + 
'    <style>div#preloaded-images { position: absolute; overflow: hidden; left: -9999px; top: -9999px; height: 1px; width: 1px; } </style>' +
'    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>' + 
'    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script>' + 
'    <script src= "http://ajax.googleapis.com/ajax/libs/angularjs/1.2.26/angular.min.js"></script>' + 
'    <!--[if lt IE 9]><script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script><![endif]-->' + 
'    <script language="JavaScript">\n' + staylogged +
'\nvar fontsize = ' + font_size + ';\n' + 
'var saveWidth = $("#picture").width(); // Save image size\n' + 
'var picHtml = "<img id=\'picture\' src=\'/users/' + picture_url + '\' />";\n' + 
' // Image tag for above Tweats\n' + 
'var picHtmlBottom = "<img id=\'picture\' src=\'/users/' + picture_url + '\' style=\'position:relative;top:-20px;padding-bottom:20px\' />"; // Image tag for below Tweats\n' + 
'var color = "' + text_color + '";\n' + 
'var pic_scale = ' + pic_scale + ';\n' + 
'var pic_position = "' + pic_position + '";\n' + 
'var pic_visible = "' + pic_visible + '";\n' + staySignedIn + 
'preload("/users/xdel.png","/users/backviolet.png","/users/transparent.gif","/users/' + picture_url + 
'","/users/favicon.png");\n'+
'function preload() {\n'+
'  for (var i = 0; i < arguments.length; i++) {\n'+
'    $("<img />").attr("src", arguments[i]);\n'+
'  }\n'+
'}\n'+
'function startPic() { // Initialize image size and position\n' + 
'  if (color == "white") {\n' + 
'    color = "black";\n' + 
'    toggleBW();\n' + 
'  }\n' + 
'  if (pic_position == "Bottom") {\n' + 
'    $("body").attr("background", "/users/backviolet.png");\n' + 
'    $("#pic_top").html("");\n' + 
'    $("#pic_bottom").html(picHtmlBottom);\n' + 
'  }\n' + 
'  if (pic_position == "Top") {\n' + 
'    $("body").attr("background", "/users/backviolet.png");\n' + 
'    $("#pic_bottom").html("");\n' + 
'    $("#pic_top").html(picHtml);\n' + 
'  }\n' + 
'  if (pic_position == "Background") {\n' + 
'    $("#pic_top").html("");\n' + 
'    $("#pic_bottom").html("");\n' + 
'    $("body").attr("background", "/users/' + picture_url + '");\n' + 
'    $("body").css("background-size", "cover");\n' + 
'  }\n' + 
'  if (pic_position == "Tile") {\n' + 
'    $("#pic_top").html("");\n' + 
'    $("#pic_bottom").html("");\n' + 
'    $("body").attr("background", "/users/' + picture_url + '");\n' + 
'    $("body").css("background-size", "auto");\n' + 
'    $("body").css("background-repeat", "repeat");\n' + 
'  }\n' + 
'  if (pic_scale != 1) {\n' + 
'    $("#picture").width($("#picture").width() * pic_scale);\n' + 
'  }\n' + 
'}\n' + 
'$(document).ready(function() { // Change image size or position\n' + 
'  $("#selsize").change(function() {\n' + 
'    if ($("#picture").width() == 0) {\n' + 
'      $("#picture").width(saveWidth);\n' + 
'    }\n' + 
'    var date = new Date();\n' + 
'    date.setTime(date.getTime() + (86400 * 365 * 67));\n' + 
'    $("body").attr("background", "/users/backviolet.png");\n' + 
'    $("body").css("background-size", "auto");\n' + 
'    $("body").css("background-repeat", "repeat");\n' + 
'    if ($("#selsize").val() == "Top") {\n' + 
'      $("#pic_bottom").html("");\n' + 
'      $("#pic_top").html(picHtml);\n' + 
'      $("#picture").width($("#picture").width() * pic_scale);\n' + 
'      document.cookie = "pic_position=Top; expires=" + date.toGMTString() + "; path=/";\n' + 
'    }\n' + 
'    if ($("#selsize").val() == "Bottom") {\n' + 
'      $("#pic_top").html("");\n' + 
'      $("#pic_bottom").html(picHtmlBottom);\n' + 
'      $("#picture").width($("#picture").width() * pic_scale);\n' + 
'      document.cookie = "pic_position=Bottom; expires=" + date.toGMTString() + "; path=/";\n' + 
'    }\n' + 
'    if ($("#selsize").val() == "Background") {\n' + 
'      $("#pic_top").html("");\n' + 
'      $("#pic_bottom").html("");\n' + 
'      $("body").attr("background", "/users/' + picture_url + '");\n' + 
'      $("body").css("background-size", "cover");\n' + 
'      document.cookie = "pic_position=Background; expires=" + date.toGMTString() + "; path=/";\n' + 
'    }\n' + 
'    if ($("#selsize").val() == "Tile") {\n' + 
'      $("#pic_top").html("");\n' + 
'      $("#pic_bottom").html("");\n' + 
'      $("body").attr("background", "/users/' + picture_url + '");\n' + 
'      $("body").css("background-size", "auto");\n' + 
'      $("body").css("background-repeat", "repeat");\n' + 
'      document.cookie = "pic_position=Tile; expires=" + date.toGMTString() + "; path=/";\n' + 
'    }\n' + 
'    if ($("#selsize").val() == "Double") {\n' + 
'      $("#picture").width($("#picture").width() * 2);\n' + 
'      pic_scale = pic_scale * 2;\n' + 
'      document.cookie = "pic_scale=" + pic_scale + "; expires=" + date.toGMTString() + "; path=/";\n' + 
'    }\n' + 
'    if ($("#selsize").val() == "Half") {\n' + 
'      $("#picture").width($("#picture").width() / 2);\n' + 
'      pic_scale = pic_scale / 2;\n' + 
'      document.cookie = "pic_scale=" + pic_scale + "; expires=" + date.toGMTString() + "; path=/";\n' + 
'    }\n' + 
'    if ($("#selsize").val() == "Hide") {\n' + 
'      saveWidth = $("#picture").width();\n' + 
'      $("#picture").width(0);\n' + 
'      pic_visible = "Hide";\n' + 
'      document.cookie = "pic_visible=" + pic_visible + "; expires=" + date.toGMTString() + "; path=/";\n' + 
'    }\n' + 
'    if ($("#selsize").val() == "Show") {\n' + 
'      $("#picture").width(saveWidth);\n' + 
'      pic_visible = "Show";\n' + 
'      document.cookie = "pic_visible=" + pic_visible + "; expires=" + date.toGMTString() + "; path=/";\n' + 
'    }\n' + 
'    $("#selsize").val("Caption");\n' + 
'    window.location.replace("/");\n' + 
'  });\n' + 
'});\n' + 
'   function signOut() {\n' + 
'         var date = new Date();\n' + 
'         date.setTime(date.getTime() - 7200);\n' + 
'         document.cookie = "user_name=' + user_name + '; expires=" + date.toGMTString() + "; path=/";\n' + 
'         document.cookie = "password=' + password + '; expires=" + date.toGMTString() + "; path=/";\n' + 
'         window.location.replace("/user/signout");\n' + 
'       }\n' + 
'   function unsubscribe() {\n' + 
'     if (confirm("Are you sure you want to unsubscribe to Tweater and delete your account?")) {\n' + 
'     document.cookie = "user_name=' + user_name + '";\n' + 
'     document.cookie = "password=' + password + '";\n' + 
'     window.location.replace("/user/unsubscribe");\n' + 
'     }\n' + 
'   }\n' + 
'   function staySignedIn() {\n' + 
'     var date = new Date();\n' + 
'     date.setTime(date.getTime() + (86400 * 365 * 67));\n' + 
'     document.cookie = "user_name=' + user_name + '; expires=" + date.toGMTString() + "; path=/";\n' + 
'     document.cookie = "password=' + password + '; expires=" + date.toGMTString() + "; path=/";\n' + 
'   }\n' + 
'   function staySignedInWithAlert() {\n' + 
'     staySignedIn();\n' + 
'     alert("You will now remain signed in.");\n' + 
'   }\n' + 
'  function about() {\n' + 
'    alert("Tweater is an app created by David K. Crandall, \\nto show his programming skills using Node.js, ' + 
'Express, MySQL, Bootstrap, Angular.js, jQuery, JavaScript, HTML5 and CSS3. The sourcecode \\nis in this GitHub ' + 
'repository:\\n\\nhttps:' + String.fromCharCode(8260, 8260) + 'github.com/davareno58/tweaternode\\n\\nNote:  ' + 
'The creator of this website doesn\'t assume responsibility for its usage by others.");' + 
'  }\n' + 
'   function contact() {\n' + 
'  alert("David Crandall\'s email is crandadk@aol.com");\n' + 
'   }\n' + 
'   function textErase() { // Erase input fields\n' + 
'     $("#tweat").val("");\n' + 
'     $("#hashtag_search").val("");\n' + 
'     $("#search_any").val("");\n' + 
'     $("#search_one").val("");\n' + 
'     $("#search_two").val("");\n' + 
'   }\n' + 
'   function textLarger() {\n' + 
'     fontsize = fontsize + 4;\n' + 
'     if (fontsize  > 72) {\n' + 
'       fontsize = 72;\n' + 
'     }\n' + 
'     var date = new Date();\n' + 
'     date.setTime(date.getTime() + (86400 * 365 * 67));\n' + 
'     document.cookie = "font_size=" + fontsize + "; expires=" + date.toGMTString() + "; path=/";\n' + 
'     location.replace("' + SELF_NAME + '");\n' + 
'     return 0;\n' + 
'   }\n' + 
'   function textSmaller() {\n' + 
'     fontsize = fontsize - 4;\n' + 
'     if (fontsize < 6) {\n' + 
'       fontsize = 6;\n' + 
'     }\n' + 
'     var date = new Date();\n' + 
'     date.setTime(date.getTime() + (86400 * 365 * 67));\n' + 
'     document.cookie = "font_size=" + fontsize + "; expires=" + date.toGMTString() + "; path=/";\n' + 
'     location.replace("' + SELF_NAME + '");\n' + 
'   }\n' + 
'   function fontEntry() { // Choose font\n' + 
'     var newfont = prompt("Current font: ' + font + '. Enter desired font: ", "Helvetica");\n' + 
'     if ((newfont != "") && (newfont != "' + font + '")) {\n' + 
'       var date = new Date();\n' + 
'       date.setTime(date.getTime() + (86400 * 365 * 67));\n' + 
'       document.cookie = "font_family=" + newfont + "; expires=" + date.toGMTString() + "; path=/";\n' + 
'       location.replace("' + SELF_NAME + '");\n' + 
'     }\n' + 
'   }\n' + 
' // Text color for contrast\n' + 
'   function toggleBW() { // Toggle font color black/white\n' + 
'     var date = new Date();\n' + 
'     date.setTime(date.getTime() + (86400 * 365 * 67));\n' + 
'     if (color == "black") {\n' + 
'       $("body").css("color", "white");\n' + 
'       $("body").css("background-color", "black");\n' + 
'       $(".row").css("color", "white");\n' + 
'       $(".inbox").css("background-color", "black");\n' + 
'       color = "white";\n' + 
'       document.cookie = "text_color=white; expires=" + date.toGMTString() + "; path=/";\n' + 
'     } else {\n' + 
'       $("body").css("color", "black");\n' + 
'       $("body").css("background-color", "white");\n' + 
'       $(".row").css("color", "black");\n' + 
'       $(".inbox").css("background-color", "white");\n' + 
'       color = "black";\n' + 
'       document.cookie = "text_color=black; expires=" + date.toGMTString() + "; path=/";\n' + 
'     }\n' + 
'     $("#bw").css("color", color);\n' + 
'     $("#bw").html(color.substr(0,1).toUpperCase());\n' + 
'   }\n' + 
'   function shownLimit() { // Change maximum number of Tweats and Search Results\n' + 
'     var newlimit = prompt("Current limit of Tweats and Search Results: ' + shown_limit + '. Enter desired limit: ", "50");\n' + 
'     if ((newlimit) && (newlimit != "' + shown_limit + '")) {\n' + 
'       newlimit = parseInt(newlimit);' + 
'       if ((newlimit < 1) || (isNaN(newlimit))) {\n' + 
'         newlimit = 50;\n' + 
'       }\n' + 
'       var date = new Date();\n' + 
'       date.setTime(date.getTime() + (86400 * 365 * 67));\n' + 
'       document.cookie = "shown_limit=" + newlimit + "; expires=" + date.toGMTString() + "; path=/";\n' + 
'       location.replace("' + SELF_NAME + '");\n' + 
'     }\n' + 
'   }\n' + 
'   function tweatWidth() { // Change maximum width of Tweats display\n' + 
'     var newwidth = prompt("Current width of Tweats display: ' + tweat_width + 
' characters. Enter desired width: ", "80");\n' + 
'     if ((newwidth != "") && (newwidth != "' + tweat_width + '")) {\n' + 
'       if ((newwidth == "") || (newwidth + 1 == 1) || (newwidth.indexOf("-") >= 0)) {\n' + 
'         newwidth = 80;\n' + 
'       }\n' + 
'       var date = new Date();\n' + 
'       date.setTime(date.getTime() + (86400 * 365 * 67));\n' + 
'       document.cookie = "tweat_width=" + newwidth + "; expires=" + date.toGMTString() + "; path=/";\n' + 
'       location.replace("' + SELF_NAME + '");\n' + 
'     }\n' + 
'   }\n' + 
'   function picUrl() { // Add html tags to given image URL\n' + 
'     $("#tweat").val($("#tweat").val().replace(/(http\\S+)/gi, \'<img src="$1" />\'));\n' + 
'   }\n' + 
'   function viewUser(user) { // Show another user\'s Public Page (profile)\n' + 
'     window.open("' + SELF_NAME + '?view_user_name=" + user);\n' + 
'   }\n' + 
'   function settings() { // Change password or email address\n' + 
'     var chosen = prompt("Would you like to change your password or your email address? " + ' + 
'"(password or email)", "");\n' + 
'     if (chosen.toLowerCase() == "password") {\n' + 
'       window.open("change_password.html?return=' + ret + '");\n' + 
'     } else if (chosen.toLowerCase().substring(0,5) == "email") {\n' + 
'       var emailAddress = prompt("Enter your new email address or just press OK to have no email " + ' + 
'"address:", "");\n' + 
'       location.replace("' + SELF_NAME + '?new_email_address=" + emailAddress);\n' + 
'     }\n' + 
'   }\n' + 
'   function notifications() { // Set email Tweat Notifications preference\n' + 
'     var notify = prompt("Would you like email Tweat Notifications of Tweats posted by people " + ' + 
'       "you\'re following (If so, add apache@crandall.altervista.org to your email contact list)? " + ' + 
'"(Yes or No)", "");\n' + 
'     if (notify.trim().toLowerCase().substr(0,1) == "y") {\n' + 
'       location.replace("' + SELF_NAME + '?notify=1");\n' + 
'     } else {\n' + 
'       location.replace("' + SELF_NAME + '?notify=0");  \n' + 
'     }\n' + 
'   }\n' + 
'   function hashtagSearch() { // Search Tweats by hashtag (subject), e.g. #popmusic\n' + 
'     var hashtag = $("#hashtag_search").val();\n' + 
'     hashtag = hashtag.trim().toLowerCase();\n' + 
'     if (hashtag.substr(0,1) == "#") {\n' + 
'       hashtag = hashtag.substr(1);\n' + 
'     }\n' + 
'     hashtag = hashtag.replace(/(\\*)/g, "%2A");\n' + 
'     hashtag = hashtag.replace(/\\?/g, "%3F");\n' + 
'     hashtag = hashtag.replace(/ /g, "");\n' + 
'     window.open("hashtag_search_results.html?hashtag_search=" + hashtag + "&admin=' + status + 
'&return=' + ret + '");\n' + 
'   }\n' + 
'   function chatToggle(mode) { // Toggle Chat Mode for 10-second Tweats refresh\n' + 
'     var date = new Date();\n' + 
'     // 5 minute timeout if user doesn\'t send a Tweat\n' + 
'     var chatTimeout = Math.floor(date.getTime()/1000) + 300;\n' + 
'     date.setTime(date.getTime() + (86400 * 365 * 67));\n' + 
'     if (mode == true) {\n' + 
'       if ($("#picture").width() == 0) {\n' + 
'         $("#picture").width(saveWidth);\n' + 
'       }\n' + 
'       $("#pic_top").html("");\n' + 
'       $("#pic_bottom").html(picHtml);\n' + 
'       $("#picture").width($("#picture").width() * pic_scale);\n' + 
'       document.cookie = "pic_position=Bottom; expires=" + date.toGMTString() + "; path=/";\n' + 
'       document.cookie = "chat_timeout=" + chatTimeout + "; expires=" + date.toGMTString() + "; path=/";\n' + 
'     }\n' + 
'     document.cookie = "chat=" + mode + "; expires=" + date.toGMTString() + "; path=/";\n' + 
'     location.replace("' + SELF_NAME + '?chat=" + mode);\n' + 
'   }\n' + 
'   $(document).ready(function() { // Set up Enter key for sending Tweat\n' + 
'     $("#tweat").keypress(function(e) {\n' + 
'       if (e.which == 13) {\n' + 
'         $("#tweatform").submit();\n' + 
'         e.preventDefault();\n' + 
'       }\n' + 
'     });\n' + 
'   });\n' + 
'   $(document).ready(function() { // Set up Enter key for sending hashtag search\n' + 
'     $("#hashtag_search").keypress(function(e) {\n' + 
'       if (e.which == 13) {\n' + 
'         hashtagSearch();\n' + 
'         e.preventDefault();\n' + 
'       }\n' + 
'     });\n' + 
'   });\n' + 
'   $(document).ready(function() {\n' + 
'     $("#search_any").keypress(function(e) {\n' + 
' // Set up Enter key for sending user search by names/info/interests\n' + 
'       if (e.which == 13) {\n' + 
'         $("#user_search_form").submit();\n' + 
'         e.preventDefault();\n' + 
'       }\n' + 
'     });\n' + 
'   });\n' + 
'</script>\n' + 
'</head>\n<body style="color:black;background-color:#C8BFE7;padding:8px;\n' + 
'font-family:' + font + ';font-size:' + font_size + 'px">' + header + formatted_message + 
'<div class="container" style="position:relative;top:-16px">' + 
'  <div class="row">' + 
'    <div class="col-md-3" style="background-color:#6644CC;text-align:center;height:259px;width:334px;' + 
margin_left + ';margin-right: 4px;padding: 10px;border: 4px outset violet">' + 
'    <form role="form">' + 
'      <div><a href="' + SELF_NAME + '" style="font-size:' + bigfont + 'px;color:red;background-color:violet">' + 
'<b>&nbsp;Tweater&nbsp;</b></a>' + 
'        <select class="inbox" id="selsize" ' + disable_photo_adjust + '>' + 
'          <option value="Caption" default>Adjust Picture:</option>' + 
'          <option value="Show">Show</option>' + 
'          <option value="Hide">Hide</option>' + 
'          <option value="Top">At the Top</option>' + 
'          <option value="Bottom">At the Bottom</option>' + 
'          <option value="Background">Full Background</option>' + 
'          <option value="Tile">Tiled Background</option>' + 
'          <option value="Double">Double the Size</option>' + 
'          <option value="Half">Half the Size</option>' + 
'        </select>' + 
'    </form>' + 
'  </div>' + 
'      <form role="form">' + 
'      <div class="form-group" style="text-align:center">' + 
'        <select style="position:relative;left:-7px" id="selview" class="inbox" ' + 
'onchange="viewUser(this.value)">' + 
'          <option>Followed Users:</option>' + followed_ones_list + 
'        </select>' + 
'        <div style="text-align:center"><button type="button" class="btn btn-warning" ' + 
'          onclick="notifications();">Notifications</button>&nbsp;' + followers_count + ' Followers</div></div>' + 
'        <form action="' + SELF_NAME + '" method="POST" role="form" id="intinfo" name="intinfo" ' + 
'          class="intinfo">' + 
'        <span>' + 
'        <div>' + 
'        <fieldset class="fieldset-auto-width" style="float:left"><b>Interests and Information:&nbsp;&nbsp;' + 
'&nbsp;</b>' + 
'        <button type="submit" id="intsubmit" name="intsubmit" class="btn btn-info" ' + 
'style="margin-left:-9px;position:relative;' + interests_position + '" >' + 
'Update</button><input type="hidden" name="message" value="Updated Interests and Information! (Limit: ' + 
TWEATMAXSIZE + ' bytes.)"></input>' + 
'        <div class="span3 form-group">' + 
'        <textarea class="textarea inbox" rows="4" cols="36" id="interests" name="interests" ' + 
'maxlength="' + TWEATMAXSIZE + '" ' + 
'          placeholder="You may type your interests and information here and press Update."' + 
'          style="font-size:' + font_size + ';height:80px;' + interests_width + '">' + interests + '</textarea>' + 
'        </div>' + 
'        </fieldset>' + 
'        </div>' + 
'        </span>' + 
'        </form>' + 
'        </div>' + 
'        <div class="col-md-9" style="background-color:#9999FF;margin-left: 0px;margin-right: 6px;' + 
'border: 4px outset darkblue;padding:10px;height:259px;width:869px">' + 
'        <form action="/user/post_tweat" method="POST" role="form" id="tweatform">' + 
'        <span>' + 
'        <div ng-app="">' + 
'        <fieldset class="fieldset-auto-width" style="float:left">' + 
'        <div class="span9 form-group" style="height:170px">' + 
'        <textarea class="textarea inbox" style="width:840px" rows="3" cols="103" id="tweat" ' + 
'name="tweat" autofocus ng-model="tweat" maxlength="' + TWEATMAXSIZE + '" placeholder=' + 
'          "Type your Tweat here (limit: ' + TWEATMAXSIZE + ' characters) and then click the Post Tweat ' + 
'button or press Enter">' + 
'          </textarea><br />' + 
'        <button type="submit" class="btn btn-success" style="position:relative;top:-8px">Post Tweat</button>' + 
'        <span style="font-family:Courier New, monospace;position:relative;top:-8px">' + 
'        <span ng-bind="(\'0000\' + (' + TWEATMAXSIZE + ' - tweat.length)).slice(-3)"></span> chars left' + 
'        </span>' + 
'        <span><button type="button" class="btn btn-warning" onclick="textErase();" style="position:relative;' + 
'top:-8px">Erase</button>' + 
'        <button type="button" class="btn btn-success" onclick="textLarger();" style="position:relative;' + 
'top:-8px;width:100px">Text Size+</button>' + 
'        <button type="button" class="btn btn-primary" onclick="textSmaller();" ' + 
'style="position:relative;top:-8px;padding-left:2px;padding-right:2px;width:80px">Text Size-</button>' + 
'        <button type="button" class="btn btn-info" onclick="fontEntry();" style="position:relative;top:-8px">' + 
'Font</button><button type="button" class="btn btn-warning" id="bw" onclick="toggleBW();" ' + 
'style="position:relative;top:-8px;margin-left:4px;width:47px;color:' + text_color + '">B</button>' + 
'        <button type="button" class="btn btn-info" style="position:relative;top:-8px;width:49px;' + 
'padding-left:3px;padding-right:3px" onclick="tweatWidth();">Width</button>&nbsp;' + 
'        <button type="button" class="btn btn-warning" id="pic_url" style="position:relative;top:-8px;' + 
'left:-6px" onclick="picUrl();">Pic</button>&nbsp;' + 
'        <button type="submit" class="btn btn-' + chat_button + '" onclick="chatToggle(' + chat_toggle + 
')" style="position:relative;left:3px;top:-8px">' + chat_button_action + ' Chat</button>' + 
'        <input type="hidden" class="form-control" name="name" value=' + esc_name + '><br /></form>' + 
'        <form><span style="position:relative;top:-4px">Hashtag Search: #</span><input type="text" ' + 
'id="hashtag_search" style="font-size:' + font_size + ';width:450px;position:relative;top:-4px" ' + 
'name="hashtag_search" maxlength="30" placeholder="To search Tweats, type the hashtag here and press--&gt;"' + 
'</input><button type="button" class="btn btn-primary" onclick="hashtagSearch();" style="margin:2px;' + 
'position:relative;top:-3px;left:2px">Hashtag Search</button>&nbsp;' + 
'        <button type="button" class="btn btn-warning" onclick="shownLimit();" style="position:relative;' + 
'top:-3px;padding-left:3px;padding-right:3px">Limit: ' + shown_limit + '</button>' + 
'        </span></span><br /></div></fieldset></div></form>' + 
'        <form action="user_search_results.html?admin=' + status + '&return=' + ret + '" method="POST" ' + 
'role="form" target="_blank" id="user_search_form"><br />' + 
'        <nobr><span style="position:relative;top:-32px">User Search: </span><textarea ' + 
'class="textarea inbox" rows="1" cols="75" id="search_any" name="search_any" maxlength="250" ' + 
' style="font-size:' + font_size + ';position:relative;top:-22px;width:613px" ' + 
'placeholder="To search by interests, info or names, type them here and press--&gt;"></textarea>&nbsp;' + 
'<button type="submit" class="btn btn-info" style="position:relative;top:-33px;left:-1px;height:33px">' + 
'User Search</button></nobr><br /></form><form action="boolean_user_search_results.html?admin=' + status + '&return=' + ret + '" method="POST" role="form" target="_blank"><br />' + 
'        <nobr><span style="position:relative;top:-49px;left:-40">Boolean Search: <input type="text" ' + 
'style="position:relative;width:250px" placeholder="First Search Term" id="search_one" ' + 
'          name="search_one" maxlength="30" size="26">' + 
'        <select class="inbox" id="search_type" name="search_type" style="position:relative;left:-5px">' + 
'                  <option value="AND" default>AND</option>' + 
'                  <option value="OR">OR</option>' + 
'                  <option value="NOT">NOT</option>' + 
'        </select><input type="text" style="position:relative;left:-5px;width:250px" ' + 
'placeholder="Second Search Term" id="search_two" name="search_two" value="" maxlength="30" size="26">' + 
'        <button type="submit" class="btn btn-warning" style="position:relative;top:-2px;left:-6px">Boolean ' + 
'Search</button></span></nobr></form>' + 
'        </div></div></div><div class="row">' + decoded_tweat_list + 
'&nbsp;<br />&nbsp;<br />&nbsp;</div>' +
'<div id="preloaded-images"> <img src="/users/backviolet.png" width="1" height="1" /> <img src="/users/xdel.png" width="1" height="1" /> <img src="/users/favicon.png" width="1" height="1" /> <img src="/users/transparent.gif" width="1" height="1" /> <img src="/users/' + picture_url + '" width="1" height="1" /> </div>' +
'</body></html>');
      res.end(" ");
      return;
    });
  }
}

function main_init(req) {
/**
 * Initialize user header HTML and user variables from cookies.
 * @param {string} var_name Name of querystring variable.
 * @returns {string} value of querystring variable <var-name>.
 */

// Get various cookies data
  if (cookies.get('pic_scale')) {
    pic_scale = cookies.get('pic_scale'); // Uploaded image scale multiplier
    if (pic_scale > 16) {
      pic_scale = 16; // Scale upper limit
    }
    if (pic_scale <= 0.01) {
      pic_scale = 1/64; // Scale lower limit
    }
  } else {
    pic_scale = 1; // Default scale is full-size
  }

console.log("pic_position to be read");
  if (cookies.get('pic_position')) { // Uploaded image position
    pic_position = cookies.get('pic_position');
  } else {
    pic_position = "Top"; // Default is above Tweats
  }
console.log("pic_position read:" + pic_position);
  if (cookies.get('pic_visible')) { // Uploaded image visibility
    pic_visible = cookies.get('pic_visible');
  } else {
    pic_visible = "Show"; // Default is visible
  }
    
  if (cookies.get('text_color')) { // Text color can be changed to white for contrast with image in background
    text_color = cookies.get('text_color');
  } else {
    text_color = "black";
  }
  
  if (cookies.get('font_size')) { // Text size can be adjusted, especially for the vision-impaired
    font_size = cookies.get('font_size');
  } else {
    font_size = FONTSIZE;
  }
  bigfont = font_size * 1.5; // Large text size

  if (cookies.get('tweat_width')) { // Display width of Tweats is adjustable
    tweat_width = cookies.get('tweat_width');
  } else {
    tweat_width = Math.floor(1600 / font_size);
  }
   
  if (cookies.get('shown_limit')) { // Maximum number of Tweats and Search Results is adjustable
    shown_limit = cookies.get('shown_limit');
    if (isNaN(shown_limit)) {
      shown_limit = 50;
    }
  } else {
    shown_limit = 50;
  }
  
  if (cookies.get('font_family')) { // Font is changeable
    font = cookies.get('font_family') + ", Helvetica";
  } else {
    font = "Helvetica";
  }

  chat = 'false';
  if (cookies.get('chat')) { // Chat mode refreshes Tweat display every 10 seconds for real-time conversation
    //chat = cookies.get('chat');
  }

// header is menu bar buttons at top of page
  if (ret == "_chrome") {
    header = '<nav class="navbar navbar-default" style="width:1207px">' + 
'    <ul class="nav nav-pills" style="background-color:#C0C0F0">' + 
'      <li role="presentation" class="btn btn-success"><a href="' + SELF_NAME + '" style="color:lightgray">' + 
'Home</a></li>' + 
'      <li role="presentation"><button type="button" class="btn btn-info" style="height:54px;width:91px"' + 
'        onclick="about();">About</button></li>' + 
'      <li role="presentation" class="btn btn-success"><a href="/user/upload_picture" ' + 
'        style="color:lightgray" target="_blank">Upload Picture</a></li>' + 
'      <li role="presentation"><button type="button" class="btn btn-primary" style="height:54px;width:178px"' + 
'        onclick="staySignedInWithAlert();">Remain Signed In</button></li>' + 
'      <li role="presentation"><button type="button" class="btn btn-success" style="color:lightgray;' + 
'width:104px;height:54px" onclick="contact();">Contact</button></li>' + 
'      <li role="presentation"><button type="button" class="btn btn-warning" style="height:54px;width:126px"' + 
'        onclick="unsubscribe();">Unsubscribe</button></li>' + 
'      <li role="presentation" class="btn btn-info" style="width:96px"><a href="/user/help" target="_blank">' + 
'Help</a></li>' + 
'      <li role="presentation" class="btn btn-primary"><a onclick="settings();" style="color:lightgray">' + 
'Settings</a></li>' + 
'      <li role="presentation" class="btn btn-danger"><a href="/user/signout" onclick="signOut();"' + 
'        style="color:lightgray">Sign Out</a></li>' + 
'     <li role="presentation" class="btn btn-info">' + 
'        <a href="/users/view_user_name/' + user_name + '" target="_blank">Public Page</a>' + 
'      </li>' + 
'    </ul>' + 
'</nav>';
  } else if (ret == "_msie") {
    header = '<nav class="navbar navbar-default" style="width:1215px">' + 
'    <ul class="nav nav-pills" style="background-color:#C0C0F0">' + 
'      <li role="presentation" class="btn btn-success"><a href="' + SELF_NAME + '" style="color:lightgray">' + 
'Home</a></li>' + 
'      <li role="presentation"><button type="button" class="btn btn-info" style="height:54px;width:96px"' + 
'        onclick="about();">About</button></li>' + 
'      <li role="presentation" class="btn btn-success"><a href="upload_picture.html?return=' + ret + '" ' + 
'        style="color:lightgray" target="_blank">Upload Picture</a></li>' + 
'      <li role="presentation" class="btn btn-primary"><a href="' + SELF_NAME + '" ' + 
'        onclick="staySignedInWithAlert();" style="color:lightgray">Remain Signed In</a></li>' + 
'      <li role="presentation"><button type="button" class="btn btn-success" style="color:lightgray;' + 
'width:104px;height:54px" onclick="contact();">Contact</button></li>' + 
'      <li role="presentation" class="btn btn-warning"><a href="' + SELF_NAME + '" onclick="unsubscribe();">' + 
'Unsubscribe</a></li>' + 
'      <li role="presentation" class="btn btn-info" style="width:100px"><a href="/user/help" target="_blank">' + 
'Help</a></li>' + 
'      <li role="presentation" class="btn btn-primary"><a onclick="settings();" style="color:lightgray">' + 
'Settings</a></li>' + 
'      <li role="presentation" class="btn btn-danger"><a href="signout.html" onclick="signOut();"' + 
'        style="color:lightgray">Sign Out</a></li>' + 
'     <li role="presentation" class="btn btn-info">' + 
'        <a href="' + SELF_NAME + '?view_user_name=' + user_name + '" style="width:105px" target="_blank">Public Page</a>' + 
'      </li>' + 
'    </ul>' + 
'</nav>';
  } else if (ret == "_firefox") { // to be edited:
    header = '<nav class="navbar navbar-default" style="width:1215px">' + 
'    <ul class="nav nav-pills" style="background-color:#C0C0F0">' + 
'      <li role="presentation" class="btn btn-success"><a href="' + SELF_NAME + '" style="color:lightgray">' + 
'Home</a></li>' + 
'      <li role="presentation"><button type="button" class="btn btn-info" style="height:54px;width:100px"' + 
'        onclick="about();">About</button></li>' + 
'      <li role="presentation" class="btn btn-success"><a href="upload_picture.html?return=' + ret + '" ' + 
'        style="color:lightgray" target="_blank">Upload Picture</a></li>' + 
'      <li role="presentation" class="btn btn-primary"><a href="' + SELF_NAME + '" ' + 
'        onclick="staySignedInWithAlert();" style="color:lightgray">Remain Signed In</a></li>' + 
'      <li role="presentation"><button type="button" class="btn btn-success" style="color:lightgray;' + 
'width:104px;height:54px" onclick="contact();">Contact</button></li>' + 
'      <li role="presentation" class="btn btn-warning"><a href="' + SELF_NAME + '" onclick="unsubscribe();">' + 
'Unsubscribe</a></li>' + 
'      <li role="presentation" class="btn btn-info" style="width:100px"><a href="/user/help" target="_blank">' + 
'Help</a></li>' + 
'      <li role="presentation" class="btn btn-primary"><a onclick="settings();" style="color:lightgray">' + 
'Settings</a></li>' + 
'      <li role="presentation" class="btn btn-danger"><a href="signout.html" onclick="signOut();"' + 
'        style="color:lightgray">Sign Out</a></li>' + 
'     <li role="presentation" class="btn btn-info">' + 
'        <a href="' + SELF_NAME + '?view_user_name=' + user_name + '" style="width:105px" target="_blank">Public Page</a>' + 
'      </li>' + 
'    </ul>' + 
'</nav>';
  }
}

function unsubscribe_processing () {
/**
 * Process unsubscribe request.
 */
  user_name = cookies.get('user_name').trim().replace("%40","@");
  password = cookies.get('password').trim().replace("%40","@");
  password_hash = crypto.createHmac("MD5", CRYPT_SALT).update(password).digest("base64");

  var client = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
  client.query("USE " + DATABASE_NAME);
  client.query("DELETE FROM " + DATABASE_TABLE + " WHERE ((user_name = ?) OR (email = ?)) AND (BINARY password_hash = ?)", [user_name, user_name, password_hash], function (err, results, fields) {
    client.end();
    if (err) {
      throw err;
    } else {
      var date = new Date();
      date.setTime(date.getTime() - 7200);
      cookies.set('user_name', '', date); // Set cookies to be deleted
      cookies.set('password', '', date);
      cookies.set('unsub', '', date);

// Display good-bye page
      res.end('<!DOCTYPE html><HTML><HEAD><TITLE>TWEATER UNSUBSCRIBE</TITLE>' + 
'<LINK rel="shortcut icon" href="/users/favicon.png" type="image/png"></HEAD>' + 
'<BODY style="background-color:#99D9EA;font-family:' + font + ';font-size:' + font_size + 'px">' + 
'<h1 style="text-align:center">Tweater: You are now unsubscribed to Tweater. Sorry to see you go!<br />' + 
'(Actually I\'m a computer and have no human feelings!)</h1><h2 style="text-align:center"><a href="' + SELF_NAME + 
'">Click here to sign in another user or register a new user.</a></h2><img src="/users/tweatysad.png" /></BODY></HTML>');
    }
  }); //
}

function sign_in_auto_get_credentials() {
/**
 * Sign in automatically with credentials from cookies.
 */
  /*cookies.get('password').trim(); // most pw's:peter ***
  user_name = cookies.get('user_name').trim().replace("%40","@");
  password = cookies.get('password').trim().replace("%40","@");
console.log("user_name cookie:" + cookies.get('user_name'));*/
name = 'Peter Griffin'; // Testing creds ***
user_name = 'petergriffin'; //cookies.get('user_name').trim();
password = 'peter';

  password_hash = crypto.createHmac("MD5", CRYPT_SALT).update(password).digest("base64");
console.log("user_name:" + user_name);
  if (cookies.get('stay_logged_in')) {
    stay_logged_in = cookies.get('stay_logged_in').trim();
  }
}

function change_email_notify() {
/**
 * Change Tweat Email Notifications preference.
 */
  if (query['notify'] == '0') {
    tweat_notify = 0;
    message = "Tweat Notifications are now DISABLED.";
  } else {
    tweat_notify = 1;
    message = "Tweat Notifications are now enabled.";
  }
  var client4 = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
  client4.query("USE " + DATABASE_NAME);
  client4.query("SET NAMES 'utf8'");
  client4.query("UPDATE users SET tweat_notify = ? WHERE user_name = ? AND binary password_hash = ?" + 
    " LIMIT 1", [tweat_notify, user_name, password_hash], function (err4, results4, fields4) {
    if (err4) {
      message = "ERROR: Tweat Notification was not updated! Sorry, but something went wrong.<br />" + 
        "You may try again. ";
      //throw err4;
    }
  }); //
  client4.end();
}

function change_email_address() {
/**
 * Change email address.
 */
  var new_email_address = query['new_email_address'];
  console.log("new_email_address given:" + new_email_address.length);
  if (!new_email_address) {
    new_email_address = "";
    null_word = "None";
  } else {
    null_word = "";
  }
  try {
    var result = utf8.decode(new_email_address);
  console.log('a valid utf8 (from ', new_email_address, '): ', result);
  } catch (e) {
    if (new_email_address) {
  console.log('Invalid UTF-8 (', new_email_address, '): ', e);
  	 message = "ERROR: Email address not updated! " + new_email_address + " is invalid. ";
  	       //res.statusCode = 412;
    }
  }
  if (new_email_address.length > 2) {
    tweat_notify = 1;
    message = "Tweat Notifications are now enabled, and your email address has been changed to: " +	        new_email_address + null_word;
  } else {
    tweat_notify = 0;
    message = "Tweat Notifications are now DISABLED, and your email address has been changed to: " +	       new_email_address + null_word;
  }
  if (!new_email_address) {
    new_email_address = null;
  }
  var client4 = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
  client4.query("USE " + DATABASE_NAME);
  client4.query("SET NAMES 'utf8'");
  client4.query("UPDATE users SET email = ?, tweat_notify = ? WHERE user_name = ? AND " + 
    "binary password_hash = ? LIMIT 1", [new_email_address, tweat_notify, user_name, password_hash], function (err4, results4, fields4) {
    if (err4) {
  	 message = "ERROR: Email address not updated! Sorry, but something went wrong.<br />" +  
  	   "You may try again. ";
  	 //throw err4;
    }
  }); //
  client4.end();
}

function delete_tweat(req, res) {
/**
 * Process the requested deletion of a Tweat.
 */
  var client2 = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
  client2.query("USE " + DATABASE_NAME);
  client2.query("SET NAMES 'utf8'"); // line 960

// Check administrator status with username and password hash of case-sensitive password
  client2.query("SELECT * from " + DATABASE_TABLE + " WHERE ((user_name = ?) OR (email = ?)) AND (BINARY password_hash = ?) LIMIT 1", [user_name, user_name, password_hash], function (err2, results2, fields2) {
    if (err2) {
      message = "ERROR: Tweat not deleted! Sorry, but something went wrong.<br />" + 
        "You may try to delete the Tweat again. ";
      throw err2;
    } else {
      var status = results2[0]['admin_status'];

      var client3 = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false }); 
      client3.query("USE " + DATABASE_NAME);
      if (status == 1) {

// Administrator deletes a Tweat
        client3.query("DELETE FROM tweats WHERE id = ? LIMIT 1", [tid], function (err3, results3, fields3) {
          if (err3) {
            message = "ERROR: Tweat not deleted! Sorry, but something went wrong.<br />" + 
          "You may try to delete the Tweat again. ";
            throw err3;
          } else {
            message = "Tweat #" + tid + " was deleted.";
          }
          //res.writeHead(200, {'Content-Type': 'text/html' });
          //sign_in_to_account(req, res);
          get_home_page(req, res);
        });
      } else {

// Non-administrator deletes his own Tweat
        client3.query("DELETE FROM tweats WHERE user_name = ? AND id = ? LIMIT 1", [user_name, tid], function (err3, results3, fields3) {
          if (err3) {
            message = "ERROR: Tweat not deleted! Sorry, but something went wrong.<br />" + 
          "You may try to delete the Tweat again. ";
            throw err3;
          } else {
            message = "The Tweat was deleted.";
          }
          //res.writeHead(200, {'Content-Type': 'text/html' });
          //sign_in_to_account(req, res);
          get_home_page(req, res);
          message = "";
        });
      }
      client3.end();
    }

  });
  client2.end();
}

function password_forgotten(res) {
/**
 * Process the requested email reset of forgotten password.
 * @param {string} res Response from server to client.
 */
  var client = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
  client.query("USE " + DATABASE_NAME);
  client.query("SET NAMES 'utf8'");
  client.query("SELECT * FROM " + DATABASE_TABLE + " WHERE (user_name = ?) OR (email = ?) LIMIT 1", [user_name, user_name], function (err, results, fields) {
    if (err) {
      //client.end();
      throw err;
    }
    var rows = results;
    email = rows[0]['email'];
console.log("e:" + email);
    if ((!email) && (rows[0]['user_name'].indexOf("@") > 0) && (rows[0]['user_name'].indexOf(".") > rows[0]['user_name'].indexOf("@") + 1)) {
      email = rows[0]['user_name'];
    }
    if (!email) {
      res.end("<p style='color:red;font-size:24px'>Sorry, but I don't have an email address " + 
        "to send the password reset code to.<br />Suggestion: Register as a new user and enter an " + 
        "email address at the bottom of the home page,<br />in case you forget your password again.</p>");
    } else {
  // Generate pseudo-random 12-character password reset code and store it in database and email it to user
      var password_reset_code = "";
      for (i = 1; i <= 12; i++) {
        password_reset_code += String.fromCharCode(Math.floor((Math.random() * 26) + 97));
      }
  console.log("code:" + password_reset_code);
      transporter.sendMail({from: 'Tweater <davareno58@gmail.com>', to: email, subject: 
        'Password reset code for ' + rows[0]['name'] + '\'s Tweater account',
        html: '<html><body style="background-color:#99D9EA;padding:8px;font-family:' + font + 
        ';font-size:' + font_size + 'px">Hello ' + rows[0]['name'] + ',<br /><br />' + 
        '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Here is the requested ' + 
        'password reset code for your Tweater account: ' + password_reset_code + '<br /><br />' + 
        '<a href="http://' + DATABASE_HOST + '/' + SELF_NAME + '" style="font-size:40px;color:red;' + 
        'background-color:violet;float:left;text-decoration:none"><b>&nbsp;Tweater&nbsp;</b></a>' + 
        '&nbsp;&nbsp;&nbsp;&nbsp;' + tweamail + '<br /><br /><br /><br /><br /><br /><br /><br />' + 
        '<br /><br /><br /><br /><br /><br /><br /><br /><br /><br /></body></html>'});

      password_reset_hash = crypto.createHmac("MD5", CRYPT_SALT).update(password_reset_code).digest("base64");
  console.log("reset hash:" + password_reset_hash); // line 1040
      var client2 = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
      client2.query("USE " + DATABASE_NAME);
      client2.query("SET NAMES 'utf8'");
      client2.query("UPDATE " + DATABASE_TABLE + " SET password_reset_hash = ? WHERE (user_name = ?) OR" + 
        " (email = ?) LIMIT 1", [password_reset_hash, user_name, user_name], function (err2, results2, fields2) {
        if (err2) {
          throw err2;
        }

  // Display password reset page with Turing test
        res.write('<!DOCTYPE html><html><head><title>Password Reset</title>' + SCRIPTS_EXTERNAL + turing + 
'</head><body style="background-color:#99D9EA;padding:8px;' + 'font-family:' + font + ';font-size:' + 
font_size + 'px" onload="turingsetup();">' + header);

  /* // Display message if any
      if (message.length > 0) { 
        res.write('<div class="container"><p style="font-size:' + bigfont + 'px;color:red">' + 
          message + '</p></div>');
        message = "";
      } */
  // Enter password reset code and choose new password
        res.end('<img src="/users/tweatyquestion.png" style="float:right" />' + 
  '        A password reset code has been sent by the Apache server to your email address<br />' + 
  '        (or to the email address in your username). If you don\'t see it there, be sure to<br />' + 
  '        check your spam folder. Please enter it here, along with the new password that<br />' + 
  '        you would like to use:<br /><br />' + 
  '        <form action="forgot_password.html?return=' + ret + '" method="POST">' + 
  '        <span>' + 
  '        <div>' + 
  '        <fieldset class="fieldset-auto-width" style="float:left">' + 
  '        <legend>Password Reset:</legend>' + 
  '        <input type="text" style="display:none">' + 
  '        <input type="password" style="display:none">' + 
  '        <div class="input-group"><input type="text" class="form-control" placeholder="Password Reset Code" ' + 
  '          name="given_password_reset_code" autocomplete="off" maxlength="20" size=20></div>' + 
  '        <div class="input-group"><input type="password" class="form-control" placeholder="New Password" ' + 
  '          name="password" autocomplete="off" maxlength="32" size="32"></div>' + 
  '        <div class="input-group"><input type="password" class="form-control" ' + 
  '          placeholder="Confirm New Password" ' + 
  '          autocomplete="off" name="password_confirm" maxlength="32" size=32></div>' + 
  '        <div class="input-group"><img src="/users/qtblue.png" /><span id="firstnumber" name="firstnumber"> </span>' + 
  '        <img src="/users/sablue.png" /> ' + 
  '        <span id="secondnumber" name="secondnumber"> </span>? <input type="text" name="given_added" ' + 
  '          autocomplete="off" size="5">' + 
  '        <input type="hidden" class="form-control" id="answer_added" name="answer_added" value="101" size="5"></div>' + 
  '        <div class="input-group"><input type="hidden" class="form-control" name="given_user_name" ' + 
  '          value=' + user_name + '></div>' + 
  '        <button type="submit" class="btn btn-success">Change Password</button>' + 
  '        </fieldset>' + 
  '        </div>' + 
  '        </span>' + 
  '        </form>' + 
  '        </body>' + 
  '        </html>');
      }); //
      client2.end();
    }
  }); //
  client.end();
  //res.end();
}

function sign_in_manual_get_credentials() {
/**
 * Sign in manually from POST data from Signin/Registration forms page.
 */
  user_name = get_post("user_name").replace("%40","@");
  password = get_post("password").replace("%40","@");
  stay_logged_in = get_post("stay_logged_in");
// testing uname/pw **:
//user_name = 'crandadk@aol.com'; //cookies.get('user_name').trim(); // Testing creds **
//password = 'oner58'; //cookies.get('password').trim(); // most pw's:peter **
//name = 'David Crandall';
  password_hash = crypto.createHmac("MD5", CRYPT_SALT).update(password).digest("base64");
  console.log("Sign in username given:" + user_name);
  console.log("pw hash:" + password_hash);
}

function post_tweat(req, res) {
/**
 * Post the new Tweat to the database.
 */

  /*try {
    var result = utf8.decode(tweat);
console.log('a valid utf8 Tweat: ', result);
  } catch (e) {
console.log('Invalid UTF-8 Tweat: ', tweat + " ", e, result);
    message = "ERROR: Tweat not posted! Invalid encoding! Must be UTF-8 text. ";
    res.statusCode = 412;
    res.end(message);
    return;
  }*/

  var client = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
  client.query("USE " + DATABASE_NAME);
  client.query("SET NAMES 'utf8'");

  hashtag_pos = tweat.indexOf("#"); // Look for hashtag (Tweat subject marker)
  if (hashtag_pos === false) {
    hashtag = null;
  } else {
    hashtag_pos++;
    start = hashtag_pos;
    while ((hashtag_pos < tweat.length) && (" ,.?!:*;/()-+{}[]|\"<>\\\`".indexOf(tweat.substr(hashtag_pos, 1)) === false)) {
      hashtag_pos++; // Find end of hashtag
    }
    hashtag = tweat.substr(start, hashtag_pos - start).toLowerCase().trim();
  }
  if (chat == "true") {
    var date = new Date();
    hashtag = "DEL" + (date.getTime() + 86400); // In Chat Mode, store delete time instead of hashtag
  }
  tweat = tweat.replace(/\+/g, " ");
  tweat = tweat.replace(/%3A/g, ":");
  tweat = tweat.replace(/%3C/g, "<");
  tweat = tweat.replace(/%3D/g, "=");
  tweat = tweat.replace(/%3E/g, ">");
  tweat = tweat.replace(/%2F/g, "/");
  tweat = tweat.replace(/%22/g, '"');
  tweat = tweat.replace(/%([0123456789ABCDEF]{2})/g, function(a, b) {
    return String.fromCharCode(parseInt("0x" + b));
  });

console.log("tw:" + tweat);
  client.query("INSERT INTO tweats (id, user_name, tweat, hashtag) values(NULL,?,?,?)", [user_name, tweat, hashtag], function (err, results, fields) {
    if (err) {
      message = "ERROR: Tweat not posted! Sorry, but something went wrong.<br />" + 
        "You may try to post the Tweat again. ";
      //throw err;
    } else {
      var client2 = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
      client2.query("USE " + DATABASE_NAME);
      client2.query("SET NAMES 'utf8'");
      client2.query("SELECT user_name, name, tweat_notify, email FROM users WHERE user_name IN (SELECT user_name FROM followed_ones WHERE followed_one = ? AND user_name != followed_one)", user_name, function (err2, results2, fields2) {
// Send Email Tweat Notification(s)
        var rows = results2;
        for (var r in rows) {
          follower_email = rows[r]['email'];
          if ((chat != "true") && (rows[r]['tweat_notify'] == 1) && (follower_email.indexOf("@") > 0)) {
            transporter.sendMail({from: "Tweater <davareno58@gmail.com>", to: follower_email, subject: 
          'Tweat Notification: ' + name + ' (' + user_name + ') just posted this Tweat',
          html: '<head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />' + 
          '</head><body style="background-color:#99D9EA;padding:8px;font-family:' + font + 
          ';font-size:' + font_size + 'px">Hello ' + rows[r]['name'] + 
          ',<br /><br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + name + ' (' + user_name + ') ' +
          'just posted this Tweat:<br /><br />' + wordwrap(unescape(tweat).replace(/\+/g, " "), 
          70, '<br />', true) + '<br /><br /><br />' + 
          '<a href="http://' + DATABASE_HOST + '/' + SELF_NAME + '">' + 
          '<b style="font-size:40px;color:red;background-color:violet;' + 
          'float:left;text-decoration:none">&nbsp;Tweater&nbsp;</b></a>&nbsp;&nbsp;&nbsp;&nbsp;' + 
           tweamail + '<br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />' + 
          '<br /><br /><br /><br /><br /><br />How to unsubscribe to Tweat Notifications:<br />' + 
          '<br />If you don\'t want to receive Tweat Notifications, ' + 
          'please sign in to <a href="http://' + DATABASE_HOST + '/' + SELF_NAME + '">your Tweater ' + 
          'Account</a> and click on<br />the Tweat Notifications button at the left. ' + 
          'A pop-up prompt will appear. Type the word No and click on OK.'});

          } else if (chat == "true") { // Reset Chat Mode timeout after Tweat
            var date = new Date();
            cookies.set('chat_timeout', (date.getTime() + 300), (date.getTime() + 7200), "/");	              
          }
        }
      }); //
      client2.end();
    }
console.log("reloading home");
    /*user_rows[0]['interests'] = interests;
    picture_ext = null;
    picture_url = "nophoto.jpg";*/
    get_home_page(req, res);

    //res.writeHead(200, {'Content-Type': 'text/html' });
    //sign_in_to_account(req, res);
  }); //
  client.end();

  //res.end(); 
}

function sign_in_to_account(req, res) {
/**
 * Sign in with credentials.
 * @param {string} res Response from server to client.
 */
console.log("In sign_in_to_account");
  var client = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });

  client.query("USE " + DATABASE_NAME);
  client.query("SET NAMES 'utf8'");
  client.query("SELECT * FROM " + DATABASE_TABLE + " WHERE ((user_name = ?) OR (email = ?)) AND " + 
    "(binary password_hash = ?) LIMIT 1", [user_name, user_name, password_hash], function (err, results, fields) {
    if (err) {
      message += "ERROR: Sorry, but something went wrong. You may try again later. ";
      //client.end();
      throw err;
    } else {
      user_rows = results;
      var num_rows = results.length;
      client.end();

// Sign In failure, so display Sign In/Registration with error message
      if (num_rows == 0) {
        if (user_name != "") {
          message = '"' + user_name + '" was not found in ' + DATABASE_TABLE + ' with the password given. ';
        } else {
          message = 'A username and a password are required. ';
        }
        if (password.toLowerCase() != password) {
          message += '<br />Note: Make sure your caps lock isn\'t on by accident, since passwords are ' + 
            'case sensitive. ';
        }
        sign_in_or_register(req, res, message);
      } else {
// Successful sign-in
// Get picture filename or default
        id = user_rows[0]['id'];
        name = user_rows[0]['name'];

        picture_ext = user_rows[0]['picture_ext'];
        if (picture_ext.length < 1) {
          picture_url = "nophoto.jpg";
        } else {
          picture_url = id + "." + picture_ext;
        }
console.log("In! pic:" + id + picture_ext);
console.log("pic url:" + picture_url);

/*// Set signed-in cookie if not yet set
        if (!isset($_COOKIE['user_name']) || !isset($_COOKIE['password'])) {
          setcookie('user_name', user_name, 0, "/");
          setcookie('password', password, 0, "/");
        }*/
        client.end();
        get_home_page(req, res);
        //res.end(); // Not needed?
      }
    }
  });
}

function password_reset(req, res) {
/**
 * Process password reset.
 * @param {string} req Request from client to server.
 * @param {string} res Response from server to client.
 */
  message = query['message'] || "";
  post_body = "";
  req.on('data', function handlePost(postchunk) {
    post_body += postchunk;
  }); //

  req.on("end", function() {
  //console.log("post_body:", post_body);

  console.log("processing forgotten pw");
    ret = query['return'];
    user_name = get_post('given_user_name').trim().replace("%40","@");
    given_password_reset_code = crypto.createHmac("MD5", CRYPT_SALT).update(get_post('given_password_reset_code').trim()).digest("base64");
    password = get_post('password').trim().replace("%40","@");
    console.log("reset:" + given_password_reset_code);
    password_confirm = get_post('password_confirm').trim();
    password_hash = crypto.createHmac("MD5", CRYPT_SALT).update(password).digest("base64");

    var client = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });

    client.query("USE " + DATABASE_NAME);
    client.query("SET NAMES 'utf8'");
    client.query("SELECT password_reset_hash FROM " + DATABASE_TABLE + " WHERE (user_name = ?) OR (email = ?)" + 
      " LIMIT 1", [user_name, user_name], function (err, results, fields) {
      if (err) {
        message += "ERROR: Sorry, but something went wrong. You may try again. ";
        //client.end();
        throw err;
      } else {
        var rows = results;
        password_reset_code = rows[0]['password_reset_hash'];
        client.end();
        cookies.set('user_name', user_name, 0);
        cookies.set('password', password, 0);

        res.writeHead(200, {'Content-Type': 'text/html' }); // pwrs
        res.write('<!DOCTYPE html><html>' + 
    '             <head><title>Password Reset Result</title>' + 
    '               <link rel="stylesheet" ' + 
    '                 href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">' + 
    '               <link rel="stylesheet" ' + 
    '                 href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">' + 
    '               <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script>' + 
    '               <!--[if lt IE 9]><script src="http://html5shim.googlecode.com/svn/trunk/html5.js">' + 
    '                 </script><![endif]-->' + 
    '             </head>' + 
    '             <body style="background-color:#c0c0f0;padding:8px;font-family:' + font + 
    ';font-size:' + font_size + '">' + header + '<div class="container">' + message + '</div>');
    console.log("gvn ad:" + get_post("given_added"));
    console.log("ad:" + get_post("answer_added"));
        if (get_post("answer_added") != get_post("given_added")) {
          res.end('<br /><br /><br /><blockquote><p style="color:red">The answer to the math question ' + 
    'was incorrect. To try again,<br />click the browser\'s Back button, or return to the ' + 
    '<span style="color:black"><a href="index.html">Sign In</a>' + 
    '             <span style="color:red"> page,<br />enter your username and then ' + 
    '             click on \'I forgot my password\'<br />and click the Sign In button to get ' + 
    '             another password reset code<br />sent to your email address.</p></blockquote></body></html>');
        } else if (given_password_reset_code != password_reset_code) {
          res.end('<br /><br /><br /><blockquote><p style="color:red">The password reset code given is not ' + 
    'correct. To try again,<br />click the browser\'s Back button, or return to the ' + 
    '<span style="color:black"><a href="' + SELF_NAME + '">Sign In</a>' + 
    '             <span style="color:red"> page,<br />enter your username and then ' + 
    '             click on \'I forgot my password\'<br />and click the Sign In button to get ' + 
    '             another password reset code<br />sent to your email address.</p></blockquote></body></html>');
        } else if (password != password_confirm) {
          res.end('<br /><br /><br /><blockquote><p style="color:red">The new password confirmation ' + 
    'does not match the new password.<br />To try again, click the browser\'s Back button, or return to the ' + 
    '             <br /><span style="color:black"><a href="index.html">Sign In</a>' + 
    '             <span style="color:red"> page, enter your username and then click on ' + 
    '             <br />\'I forgot my password\' and click the Sign In button to get another ' + 
    '             <br />password reset code sent to your email address.</p></blockquote></body></html>');
        } else {
          var client2 = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });

          client2.query("USE " + DATABASE_NAME);
          client2.query("SET NAMES 'utf8'");
          client2.query("UPDATE " + DATABASE_TABLE + " SET password_hash = ? WHERE user_name = ? LIMIT 1", [password_hash, user_name], function (err2, results2, fields2) {
            if (err2) {
              message = "ERROR: Sorry, but something went wrong. You may try again. ";
              //throw err2;
              //client2.end();
            } else {
              client2.end();
            }
            get_home_page(req, res);
            //res.end();
            //res.location('http://localhost:8888/' + SELF_NAME);

            //http.post({ host: req.headers.host, path: '/' + SELF_NAME });
          }); //
        }
      }
    }); //
  //res.redirect("http://" + req.headers.host + "index.js"); 
  });
  //console.log("Request for " + action + " received.");
}

function help_html_setup() {
/**
 * Help page HTML.
 * @returns {string} Help page HTML.
 */
  try {
    font_size = (font_size ? font_size : "18");
    bigfont = (bigfont ? bigfont : "27");
  } catch(e) {
    font_size = "18";
    bigfont = "27";
  } finally {
    return '<!DOCTYPE html><html><head><title>Tweater Help</title><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css"><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css"><script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script><body style="background-color:#99D9EA;font-size:' + font_size + 'px"><div><a href="' + SELF_NAME + '" style="font-size:' + 
bigfont + 'px;color:red;background-color:#990099"><b>&nbsp;Tweater Help&nbsp;</b></a></div><img src="/users/tweatyquestion.png" style="float:right" />' + help_html;
  }
}

function page_not_found_404(res) {
/**
 * Display 404 Error page: Page not found and Help page.
 * @param {string} res Response from server to client.
 */
  try {
    font_size = (font_size ? font_size : "18");
    bigfont = (bigfont ? bigfont : "27");
  } catch(e) {
    font_size = "18";
    bigfont = "27";
  } finally {
  res.writeHead(404, {'Content-Type': 'text/html' }); // 404
  res.end("<!DOCTYPE html><html><head><title>Error 404 Page Not Found</title>" + 
"<body style='background-color:#99D9EA;color:black;font-size:" + font_size + "px'>" + 
"<a href='" + SELF_NAME + "' style='font-size:" + bigfont + 
"px;'><div>&nbsp;404 Error: Tweater Page Not Found! Ne estas la pa&#285;o! La pa'jina no ecsiste!&nbsp;<br /><br /></div>" + 
"<div style='color:red;background-color:#990099'>&nbsp;Tweater Help:</div></a>" + 
"<img src='/users/tweatyquestion.png' style='float:right' />" + help_html);
  }
}

function show_home_page(req, res) { // Display signed-in user's Home page
console.log("user:" + user);
  ret = '_chrome'; // Chrome browser version of Home page
  title_position = "right: -77px;";
  sign_in_width = "width:506px;";
  margin_left = "margin-left: -43px;";
  interests_position = "left:3px;";
  interests_width = "width:310px;position:relative;top:2px";
  get_home_page(req, res);
}

function sign_in_or_register(req, res, message) {
  ret = '_chrome'; // Chrome browser version
  title_position = "right: -77px;";
  sign_in_width = "width:506px;";
  margin_left = "margin-left: -43px;";
  interests_position = "left:3px;";
  interests_width = "width:310px;position:relative;top:2px";

  cookies = new Cookies(req, res);
  main_init(req); // Initialize main variables and also data from cookies
console.log("msg:" + message);
  if (message) {
    message = '<div class="container"><p style="font-size:' + bigfont + 'px;color:red">' + message + '</p></div>';
  } else {
    message = "";
  }
  if (!email) {
    email = "";
  }
  res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8' });
  res.end('<!DOCTYPE html><html><head><title>Tweater</title><link rel="shortcut icon" href="/users/favicon.png" ' + 'type="image/png">' + SCRIPTS_EXTERNAL + turing +
'<SCRIPT LANGUAGE="JavaScript">' + 
'  function URLsetup() {' + 
'    document.getElementById("action").action = "' + SELF_NAME + '?user_name=" + ' + 
'      document.getElementById("user_name").value;' + 
'  };' + 
'  function about() {' + 
'    alert("Tweater is an app created by David K. Crandall, to show his programming skills using Node.js, ' + 
'Express, MySQL, Bootstrap, Angular.js, jQuery, JavaScript, HTML5 and CSS3. The sourcecode \\nis in this GitHub ' + 
'repository:\\n\\nhttps:' + String.fromCharCode(8260, 8260) + 'github.com/davareno58/tweaternode\\n\\nNote:  ' + 
'The creator of this website doesn\'t assume responsibility for its usage by others.");' + 
'  };' + 
'  function contact() {' + 
'    alert("David Crandall\'s email is crandadk@aol.com");' + 
'  };' + 
'</SCRIPT>' + 
'</head><body style="background-color:#99D9EA;padding:8px;font-family:' + font + '; font-size:' + font_size + 'px" onload="turingsetup();">' + message + 
'<div style="margin-left: auto; margin-right: auto;"><p style="text-align:center"><img src="/users/tweaty.png" style="width:25%;height:25%" />' + 
'<a href="' + SELF_NAME + '" style="font-size:72px;color:red;background-color:violet"><b>' + 
'&nbsp;Tweater&nbsp;</b></a><img src="/users/tweatyemail.png" style="width:25%;height:25%" />' + 
'</p></div>' + 
'<div style="margin-left: auto; margin-right: auto;position: relative;' + title_position + '">' + 
'<form action="/user/signin" method="POST" id="action">' + 
'<span>' + 
'<div>' + 
'<fieldset class="fieldset-auto-width" style="float:left;background-color:#A0C0A0;' + sign_in_width + '">' + 
'<legend style="background-color:#A0C0A0;' + sign_in_width + '">Sign In:</legend>' + 
'<div class="input-group"><input type="text" class="form-control" placeholder="Username or Email" ' + 
'  name="user_name" id="user_name" maxlength="50" size="60"></div>' + 
'<div class="input-group"><input type="password" class="form-control" placeholder="Password" ' + 
'  name="password" maxlength="32" size="32"></div>' + 
'<div class="checkbox"><label><input type="checkbox" name="forgot_password" ' + 
'  unchecked>I forgot my password.</label></div>' + 
'<div class="checkbox"><label><input type="checkbox" name="stay_logged_in" ' + 
'  unchecked>Remain signed in.</label></div>' + 
'<button type="submit" class="btn btn-success">Sign In</button>' + 
'</fieldset>' + 
'</div>' + 
'</span>' + 
'</form>' + 
'<div style="float:left">' + 
'<br /><br /><br /><br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + 
'OR&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + 
'</div>' + 
'<form action="/user/new" method="POST" autocomplete="off">' + 
'<span>' + 
'<div>' + 
'<fieldset class="fieldset-auto-width" style="float:left;background-color:#A0A0C0">' + 
'<legend style="background-color:#A0A0C0;' + sign_in_width + '">Register New User:</legend>' + 
'<input type="text" style="display:none">' + 
'<input type="password" style="display:none">' + 
'<div class="input-group"><input type="text" class="form-control" autocomplete="off" ' + 
'  placeholder="Desired Username" name="user_name" value="' + user_name + '" maxlength="50" size="50"></div>' + 
'<div class="input-group"><input type="password" class="form-control" autocomplete="off" ' + 
'  placeholder="Password: Minimum 6 Characters" name="new_user_password" maxlength="32" size="32"></div>' + 
'<div class="input-group"><input type="password" class="form-control" autocomplete="off" ' + 
'  placeholder="Confirm Password" name="password_confirm" maxlength="32" size="32"></div>' + 
'<div class="input-group"><input type="text" class="form-control" autocomplete="off" ' + 
'  placeholder="Name" name="name" value="' + name + '" maxlength="60" size="60"></div>' + 
'<div class="input-group"><input type="text" class="form-control" autocomplete="off" ' + 
'placeholder="Optional: Your Email for Tweat Notifications" name="email" value="' + email + '" ' + 
'  autocomplete="off" maxlength="50" size="50"></div>' + 
'<div class="input-group"><img src="/users/qt.png" /><span id="firstnumber" name="firstnumber"> </span>' + 
'  <img src="/users/sa.png" /> ' + 
'<span id="secondnumber" name="secondnumber"> </span>? <input type="text" name="given_added" ' + 
'  autocomplete="off" size="3"><br />' + 
'<input type="hidden" class="form-control" id="answer_added" name="answer_added" autocomplete="off" value="101"></div>' + 
'<button type="submit" class="btn btn-primary">Register</button>' + 
'</fieldset><br />' + 
'</div>' + 
'</span>' + 
'</form>' + 
'</div>' + 
'</body>' + 
'</html>'
  );
  message = "";
}

function upload_picture_uploading(req, res) {
  cookies = new Cookies(req, res);
  if (cookies.get('user_name') && cookies.get('password')) {
    var given_user_name = cookies.get('user_name').replace("%40","@");
    password = cookies.get('password').replace("%40","@");
    password_hash = crypto.createHmac("MD5", CRYPT_SALT).update(password).digest("base64");
    user = _.find(users, function(u) {
      return u.user_name == given_user_name;
    });
    if ((user) && (password_hash == user.password_hash)) {
      user_name = user.user_name;
      name = user.name;
      id = user.id;
      message = "";
      error_sorry = "Sorry, there was an error uploading your picture file. ";
    
      if (cookies.get('font_size')) {
        font_size = cookies.get('font_size');
      } else {
        font_size = FONTSIZE;
      }
      if (cookies.get('font_family')) {
        font = cookies.get('font_family') + ", Helvetica";
      } else {
        font = "Helvetica";
      }
      var fstream;
      req.pipe(req.busboy);
      req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
        console.log("Uploading: " + encoding + mimetype);
        fstream = fs.createWriteStream(__dirname + '/pictures/tmp/' + filename);
        file.pipe(fstream);
        fstream.on('close', function () {
          var  picture_ext = mimetype.substr(mimetype.lastIndexOf("/") + 1).toLowerCase();
          if (picture_ext == "jpeg") {
            picture_ext = "jpg";
          }
          var uploadOk = 0;
console.log("picext" + picture_ext);
  // Allow only certain file types
          if ((mimetype != 'image/jpg') && (mimetype != 'image/jpeg') && (mimetype != 'image/png') && (mimetype != 'image/gif')) {
            message = message + "Sorry, only .jpg, .jpeg, .png and .gif files are allowed. ";
            uploadOk = 0;
          }
  /* // Check filesize
        if (req.files.displayImage.size > 1048576) {
            message = message + "Sorry, your picture file is too large. The limit is one megabyte (1048576 bytes). ";
          uploadOk = 0;
        } */
          if ((!cookies.get('user_name')) || (!cookies.get('password'))) {
            message = message + error_sorry;
            uploadOk = 0;
          } else {
            user_name = cookies.get('user_name').trim().replace("%40","@");
            password = cookies.get('password').trim();
            password_hash = crypto.createHmac("MD5", CRYPT_SALT).update(password).digest("base64");
            uploadOk = 1;
          }
console.log("upldok" + uploadOk);

  // Check whether uploadOk has been set to 0 by any error
          if (uploadOk == 0) {
            message = message + "Your picture file was not uploaded. ";
    // If everything is ok, try to upload
          } else {
            var client = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
            console.log("pwh: " + password_hash + user_name);

            client.query("USE " + DATABASE_NAME);
            client.query("SELECT * FROM " + DATABASE_TABLE + " WHERE (user_name = ?) and (binary " + 
              "password_hash = ?)", [user_name, password_hash], function (err, results, fields) {
              if (err) {
                message = "ERROR: Picture file not uploaded! Sorry, but something went wrong.<br />" +  
                  "You may try again. ";
                    //throw err;
              } else {
                if (results) {
                  if (results[0]['picture_ext']) {
                    var old_filename = __dirname + "/pictures/" + results[0]['id'] + "." + results[0]['picture_ext'];
                    fs.unlink(old_filename, function (err, results, fields) {
                    });
  console.log("deleting " + old_filename);
                    var client2 = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
                    client2.query("USE " + DATABASE_NAME);
                    client2.query("UPDATE " + DATABASE_TABLE + " SET picture_ext = ? WHERE (user_name = ?) AND (binary" + 
                      " password_hash = ?)", [picture_ext, user_name, password_hash], function (err2, results2, fields2) {
                      if (err2) {
                        message = "ERROR: Picture not uploaded! Sorry, but something went wrong.<br />" +  
                          "You may try again. ";
                          //throw err2;
                      } else {
  console.log("new picext: " + picture_ext);
                        client2.end();
                        user.picture_ext = picture_ext;
                        fs.rename(__dirname + "/pictures/tmp/" + filename, __dirname + "/pictures/" + id + "." + picture_ext, function(err3) {
                          if (err3) {
                            message = message + error_sorry;
                          } else {
  console.log("renaming/moving: " + filename + " to " + id + "." + picture_ext);
                            message = "Picture uploaded! To see the new picture, go back to your home page an" + 
                              "d click on your browser's Refresh button or click on Home at the top left. Not" + 
                              "e: You can also post URLs of pictures that start with \\\"http\\\". After typing o" + 
                              "r pasting the URL in the Tweat textbox, click the Pic button and press Enter.";
                            res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8' });
                            res.end("<!DOCTYPE HTML><HTML><head><script>" + 
                              "alert(\"" + message + "\"); window.close();</script></head><body></body></html>");
                            //client.end();
                            message = "";
                            return;
                          }
                        });
                      }
                      if (message) {
                        res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'});
                        res.end("<!DOCTYPE HTML><HTML><head><script>" + 
                          "alert(\"" + message + "\"); window.close();</script></head><body></body></html>");
                        return;
                      }
  console.log("client2 ended. msg:" + message);
                    });
                  }
                }
              }
              if (message) {
                res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'});
                res.end("<!DOCTYPE HTML><HTML><head><script>" + 
                  "alert(\"" + message + "\"); window.close();</script></head><body></body></html>");
              } else {
                client.end();
              }
              return;
            }); //
          }
        });
      }); 
    }
      /*res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8' });
      show_home_page(req, res);*/
  } else {
    message += "Sorry, there was an error uploading your picture file. ";
    //res.redirect('back');
  /*res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8' });
    res.end("<!DOCTYPE HTML><HTML><head><script>alert(\"" + message + "\"); window.close();</script></head>" + 
      "<body></body></html>");*/
    return;
  }
}

exports.start = start;
