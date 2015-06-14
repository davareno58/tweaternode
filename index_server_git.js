// Move js msgs from a new page to same page & put resulting msg in red on reloaded home page like info updated.
// To do: chat & non-chat w/ 2 computers; DRY: more functions. More comments.

/**
 * @fileOverview Tweater Twitter-like social media application.
 * @version 2.0
 * @author <a href="mailto:davareno58@gmail.com">David K. Crandall</a>
 * @see <a href="http://crandall.altervista.org/tweater">Tweater</a>.
 *
 * Initialize constants:
 *
 * @constant {string} CRYPT_SALT Salt for encryption.
 * @constant {string} DATABASE_HOST Database host.
 * @constant {string} DATABASE_NAME Database name.
 * @constant {string} DATABASE_TABLE Database user table.
 * @constant {string} FONT_INITIAL Initial font name.
 * @constant {string} FONTSIZE Size of font in pixels.
 * @constant {string} MY_PATH Path to this file's directory.
 * @constant {string} PASSWORD Database password. ***
 * @constant {string} SCRIPTS_EXTERNAL HTML to include external JavaScripts.
 * @constant {string} SELF_NAME Name of this Node.js file.
 * @constant {string} SHOWN_LIMIT_INITIAL Initial maximum limit of Tweats shown and search results shown.
 * @constant {string} SITE_ROOT This site's root directory.
 * @constant {string} TWEATMAXSIZE Maximum number of characters allowed in a Tweat message.
 * @constant {string} USERNAME Database username.
 */
CRYPT_SALT = 'x';
DATABASE_HOST = 'my-tweater.rhcloud.com';
DATABASE_NAME = "my_crandall";
DATABASE_TABLE = "users";
EMAIL_PASSWORD = 'y';
FONT_INITIAL = "Helvetica";
FONTSIZE = "18"; // pixels
MY_PATH = '/';
PASSWORD = 'z'; // Database password
SELF_NAME = "/";
SHOWN_LIMIT_INITIAL = 50;
SITE_ROOT = "/";
TWEATMAXSIZE = "250"; // Maximum size of Tweat in characters
USERNAME = "crandall";

// Initialize requires
app = require("express")();
bodyParser = require("body-parser");
busboy = require("connect-busboy"); 
cookieParser = require("cookie-parser");
Cookies = require("cookies"); 
crypto = require("crypto"); // encryption
express = require("express");
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

transporter = nodemailer.createTransport({ service: 'Gmail', auth: { user: 'davareno58@gmail.com', pass: EMAIL_PASSWORD } });

/**
 * Create globals:
 *
 * @private {string} [bigfont="27"] Size of big font in pixels.
 * @private {string} [browser_name="Chrome"] Browser name.
 * @private {string} [chat="false"] Chat Mode status.
 * @private {string} [chat_button="success"] Chat Mode button color type.
 * @private {string} [chat_button_action="Start"] Chat Mode button action.
 * @private {string} [chat_toggle="true"] Chat Mode status chosen by clicking button.
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
 * @private {string} no_quote_tweat Version of Tweat displayed in delete popup prompt.
 * @private {string} password User's password.
 * @private {string} password_hash Encryption hash of user's password.
 * @private {string} password_reset_hash Encryption hash of password reset code.
 * @private {string} [pic_position="Top"] Position of user's uploaded image file.
 * @private {number} [pic_scale=1] Scale of user's uploaded image file.
 * @private {string} [pic_visible="Show"] Visibility of user's uploaded image file.
 * @private {string} picture_ext Extension of user's uploaded image file.
 * @private {string} picture_url URL of user's uploaded image file.
 * @private {string} port Port for Tweater app website.
 * @private {string} post_body Variable names and values from POST.
 * @private {string{}} query Object with keys and values from GET querystring variables.
 * @private {string{}} result User search result object.
 * @private {string} ret Browser version.
 * @private {number} [shown_limit=50] Maximum number of Tweats and Search Results.
 * @private {string} sign_in_width Width of sign-in page.
 * @private {string} signout_html HTML text showing signout.
 * @private {string} [status=0] Administrator status.
 * @private {string} stay_logged_in User preference for remaining signed in.
 * @private {string} [text_color="black"] Text color (black or white).
 * @private {string} tid Tweat ID.
 * @private {string} timeout_message Chat Mode timeout message.
 * @private {string} title_position Position of title on page.
 * @private {string} tweat Public message posted by user.
 * @private {string} tweat_form_html HTML for Tweat form and search fields & nearby buttons, tailored for browser.
 * @private {string} tweat_list List of formatted Tweats posted by user and user's followed users, if any.
 * @private {number} [tweat_notify=0] Preference for receiving emails of Tweats posted by followed users, if any.
 * @private {number} [tweat_width=80] Maximum width in characters of Tweats on user's page.
 * @private {string} unsubscribe_password User password for unsubscribing.
 * @private {string} upload_picture_html HTML for choosing an image to upload.
 * @private {string} user Signed-in user.
 * @private {string} user_name Username of signed-in user.
 * @private {string} user_rows Results from users database from sign-in.
 */

browser_name = "Chrome";
chat = 'false';
chat_button = 'success';
chat_button_action = 'Start';
chat_toggle = 'true';
cookies = null;
email = "";
esc_name = "";
followed_ones_list = "";
follower_email = "";
followers_count = 0;
font = FONT_INITIAL;
font_size = "18";
bigfont = font_size * 1.5;
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
name = ""; // user's name
no_quote_tweat = "";
password = "";
password_hash = "";
password_reset_hash = "";
pic_position = "Top";
pic_scale = 1;
pic_visible = "Show";
picture_ext = null;
picture_url = null;
port = process.env.PORT || 8888;
post_body = "";
query = {};
result = {};
shown_limit = SHOWN_LIMIT_INITIAL;
sign_in_width = "";
signout_html = "";
stay_logged_in = "";
status = "";
text_color = "black";
tid = "";
timeout_message = "";
title_position = "";
tweat = "";
tweat_form_html = "";
tweat_list = "";
tweat_notify = 0;
tweat_width = 80;
unsubscribe_password = "";
upload_picture_html = "";
user = "";
user_name = "";
user_rows = {0:{"interests":""}};

/**
 * External JavaScripts HTML and old MSIE shim.
 */
  SCRIPTS_EXTERNAL = '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/' +
'bootstrap.min.css"><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-' +
'theme.min.css"><script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>' + 
'<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script>' + 
'<!--[if lt IE 9]><script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script><![endif]-->';

/**
 * Turing test JavaScript against robots.
 */
  turing = '<SCRIPT LANGUAGE="JavaScript">' + 
'  function turingsetup() {' + 
'    var firstnumber = Math.floor((Math.random() * 9) + 1);' + 
'    var secondnumber = Math.floor((Math.random() * 90) + 1);' + 
'    document.getElementById("firstnumber").innerHTML = firstnumber;' + 
'    document.getElementById("secondnumber").innerHTML = secondnumber;' + 
'    document.getElementById("answer_added").value = firstnumber + secondnumber;' + 
'  };' + 
'  </SCRIPT>';

/**
 * Tweaty email picture encoded for emails.
 */
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

/**
 * Help page HTML.
 */
help_html = '<ul><li>To show a list of all users, just click the User Search button at the right.</li><li>Click your browser\'s Back button to go back to previous page(s).</li><li>To update your page or to remove red messages, click on Home at the top left<br />(or your browser\'s Refresh button).</li><li>Cookies and JavaScript must be enabled for some functions.</li><li>The User Search searches for names, usernames, information and interests,<br />and has a limit of 10 search words per search.</li><li>In a Boolean Search, at least the first term must be filled in.</li><li>Wildcards may be used in Hashtag Searches and Boolean Searches:<br /> ? for any one character, and * for any zero or more characters.</li><li>The Limit button at the right sets the number of Tweats shown and the number<br />of Search Results.</li><li>To turn on Chat Mode, click the green Start Chat button at the right.<br /> It will turn into a red Stop Chat button. In Chat Mode, the Tweats will be<br /> redisplayed every ten seconds, so any Tweats sent by someone<br /> you\'re following will appear automatically without having to click Home<br /> to reload the page. If the person you\'re following is also following you,<br /> and he\'s in Chat Mode, your new Tweats should appear automatically<br /> every ten seconds on his page as well, so you can have a real-time<br /> text conversation in Chat Mode. Actually, several people who are all following each other<br />and are in Chat Mode can have a multi-person conversation! In Chat Mode, your picture<br />is moved to the bottom of the page, and only the ten most recent Tweats are displayed.<br /> If you don\'t send a Tweat for five minutes, Chat Mode will be turned off automatically,<br /> and you would have to click Start Chat to restart it. Tweats sent in Chat Mode will be deleted<br /> automatically after 24 hours, so they can\'t have hashtags, and no email notifications<br /> are sent with these Tweats.</li><li>To post a picture by using a URL beginning with "http", type or paste it into the Tweat textbox,<br /> and then click the Pic button before pressing Enter.</li><li>To add a hashtag to a Tweat, just include the # sign followed by the hashtag,<br /> such as #popmusic (with no spaces between multiple words). Only one hashtag<br /> can be used in each Tweat, but you could post the same Tweat twice<br />with different hashtags, theoretically... <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a style="background-color:red;float:right" href="" onclick="window.close();">&nbsp;CLOSE WINDOW&nbsp;</a></li></ul></body></html>';

/**
 * HTML heredocs.
 */
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
    <link rel="shortcut icon" href="/users/favicon.png" type="image/png">
  </HEAD>
  <BODY style="background-color:#00DD00;padding:8px;font-family:Courier New, Helvetica};">
    <DIV style="width:100%">
      <DIV class="center">
        <H1 class="center">&nbsp;Picture Upload:</H1>
      </DIV>
    </DIV>
    <DIV class="center">
    <img src="/users/tweatycamera.png" style="float:left;width:50%;height:50%;margin-right:10px" />
      <FORM action="/upload_picture_uploading" method="post" enctype="multipart/form-data">
        <H2>Please select a picture file to upload (only jpg, jpeg, gif and png image files are allowed, and the maximum file size is 1 megabyte):</H2>
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
    <link rel="shortcut icon" href="/users/favicon.png" type="image/png">
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

signout_html = heredoc(function() {/*
<!DOCTYPE html>
<HTML>
  <HEAD>
    <TITLE>TWEATER SIGNOUT</TITLE>
    <META NAME="description" CONTENT="Tweater Social Site"> 
    <META NAME="keywords" CONTENT="tweater, social site, tweats">
    <META http-equiv=Content-Type content='text/html; charset=UTF-8' />
    <link rel="shortcut icon" href="/users/favicon.png" type="image/png">
  </HEAD>
  <BODY LINK="#C00000" VLINK="#800080" alink="#FFFF00" bgcolor="#99D9EA" onLoad="openit()">
    <h1 style='text-align:center'>Tweater Signout:  You are now signed out. (Please close your browser for safety.)</h1>
    <h2 style='text-align:center'>
      <a href="/">Click here to sign in.</a>
    </h2>
    <img src='/users/tweaty.png' />
  </BODY>
</HTML>
*/});

app.use(morgan('dev')); // development tracing.
app.use(bodyParser.urlencoded({extended: true, keepExtensions: true, uploadDir: __dirname + '/pictures' }));
app.use(busboy({ highWaterMark: 2 * 1024 * 1024, limits: { fileSize: 1024 * 1024 } })); // Picture upload size limit.

/**
 * Set up pictures folder redirect.
 */
app.use('/users', express.static('pictures')); // 2 static files paths, e.g. for images or CSS
app.use('/hashtag_search_results/*/*.png', express.static('pictures'));
app.use('/user_search_results/*.png', express.static('pictures'));
app.use('/change_password/pictures/*.png', express.static('pictures'));
app.use('/new_email_address/pictures/*.png', express.static('pictures'));
app.use('/*', express.static('pictures'));

/**
 * Read all users into users array.
 */
var client = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
client.query("USE " + DATABASE_NAME);
client.query("SET NAMES 'utf8'");
client.query("SELECT * FROM " + DATABASE_TABLE, function (err, results, fields) {
  if (err) {
    throw err;
  } else {
    users = results;
    client.end();
  }
});

app.get('/', function(req, res) {
/**
 * Display Sign-In or Register page.
 */
  cookies = new Cookies(req, res);
  if (cookies.get('user_name') && cookies.get('password')) {
    var given_user_name = cookies.get('user_name').replace("%40","@");
    password = cookies.get('password').replace("%40","@");

// Adjust Chat Mode start/stop button and its action
    chat_setup();

    main_init(req, res); // Initialize main variables and also data from cookies
    password_hash = passwordHash(password);
    user = _.find(users, function(u) {
      return u.user_name == given_user_name;
    });
    if ((user) && (password_hash == user.password_hash)) {
      stay_logged_in = cookies.get('stay_logged_in');
      status = user.admin_status;
      user_name = user.user_name;
      name = user.name;
      cookies = new Cookies(req, res);
      if (stay_logged_in == "on") {
// Set cookies to remain signed in.
        var date = new Date();
        date.setTime(date.getTime() + (86400000 * 365 * 67));
        res.cookie('user_name', user_name, {expires: date});
        res.cookie('password', password, {expires: date});
        res.cookie('stay_logged_in', 'on', {expires: date});
      } else {
// Set session cookies
        res.cookie('user_name', user_name); // Set cookies to be deleted
        res.cookie('password', password);
      }
      id = user.id;
      picture_ext = user.picture_ext;
      if (picture_ext) {
        picture_url = id + "." + picture_ext;
      } else {
        picture_url = "nophoto.jpg";
      }
      interests = user.interests || "";
      interests_words = user.interests_words;
      email = user.email;
      tweat_notify = user.tweat_notify;
      if (cookies.get('chat')) {
        if (cookies.get('chat') == "true") { // Reset Chat Mode timeout after Tweat
          var date = new Date();
          res.cookie("chat_timeout", date.getTime() + 300000, {maxAge: 7200000});
        }
      }
      writeHeadHTML(res);
      show_home_page(req, res);
      return;
    }
  }
  message = "";
  sign_in_or_register(req, res, "");
});

app.get('/error', function(req, res) {
/**
 * Display Sign-In or Register page with error message.
 */
  message = req.param("message");
  if (message) {
    message = message.replace(/\+/g, " ");
  }
  sign_in_or_register(req, res, message);
});

app.get('/get_tweats/:name', function(req, res) {
/**
 * Read Tweats from database in Chat Mode.
 */
  cookies = new Cookies(req, res);
  user_name = cookies.get('user_name').replace("%40", "@");
  var name_shown = req.params.name.replace(/\+/g, " ");
  shown_limit = 10;
  timeout_message = "";
  if (cookies.get('chat_timeout')) {
    chat_timeout = cookies.get('chat_timeout');
    if (chat_timeout != 'end') {
      var refresh = "<meta http-equiv='refresh' content='10'>";
      var date = new Date();
      if (date.getTime() > chat_timeout) {
// Automatically turn off chat mode
        res.cookie('chat', 'false', {maxAge: 7200000});
        res.cookie('chat_timeout', 'end', {maxAge: 7200000});
        timeout_message = "<p style='color:red'>Chat Mode has timed out and has been turned off. The timeout is five minutes. To restart Chat Mode, click the Home button at the top left to reload the page and then click Start Chat at the right.</p>";
        refresh = "";
      } else if (date.getTime() >= chat_timeout - 60000) {
        timeout_message = "<p style='color:red'>Timeout Warning: If you don't post a Tweat within one minute, Chat Mode will be turned off.</p>";
      }
    } else {
      return;
    }
  }
  getFont();
  if (cookies.get('tweat_width')) {
    tweat_width = cookies.get('tweat_width');
  } else {
    tweat_width = Math.floor(1600 / font_size);
  }
  writeHeadHTML(res);
  var client = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
  client.query("USE " + DATABASE_NAME);
  client.query("SET NAMES 'utf8'");
  client.query("SELECT t.id, t.user_name, t.tweat, u.name FROM tweats AS t INNER JOIN " + 
    "users AS u ON t.user_name = u.user_name WHERE t.user_name IN " + 
    "(SELECT followed_one FROM followed_ones AS f WHERE f.user_name = ?) ORDER BY t.id DESC LIMIT ?", [user_name,   shown_limit], function (err, results, fields) {
    if (err) {
      throw err;
    } else {

// Display Tweats in iframe with 10 second refresh for chat mode
      res.write("<!DOCTYPE html><html><head><meta charset='utf-8' />" + refresh + "<title>Tweats:</title>" + 
        "<link rel='shortcut icon' href='/users/favicon.png' type='image/png'></head><body style='color:black;" +
        "background-color:#c8bfe7;padding:8px;font-family:" + font + ";font-size:" + font_size + "px'>" + 
        timeout_message + "<table>");
      timeout_message = "";
      if (results.length) {
        for (var row = 0; row < results.length; row++) {
          myrow = results[row];
          if (myrow['name']) {
            myrow_name = myrow['name'];
            myrow_tweat = myrow['tweat'];
            tid = myrow['id'];
            myrow_hashtag = myrow['hashtag'];
          } else {
            myrow_name = "";
            myrow_tweat = "";
            myrow_hashtag ="";
          }
          if (myrow_hashtag) {
          if (myrow_hashtag.substr(0, 3) == "DEL") {
            var date = new Date();
            myrow_tweat += " chat fd:" + date.getTime() + " " + myrow_tweat.substr(3);
// Delete old chat tweat
            if (date.getTime() > myrow_hashtag.substr(3)) {
              var client2 = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
              client2.query("USE " + DATABASE_NAME);
              client2.query("DELETE FROM tweats WHERE id = ?", [tid], function (err2, results2, fields2) {
                if (err2) {
                  throw err2;
                } else {
                  client2.end();
                }
              });
              continue;
            }
          }
          }
          res.write("<tr><td style='vertical-align:top;text-align:right'><b>" + 
            wordwrap(myrow_name.replace(/%20/g, " "), 40, '<br />', true) + 
            "</b>:&nbsp;&nbsp;</td><td>" + 
            wordwrap(myrow_tweat.replace(/%20/g, " "), tweat_width, '<br />', true));
          if (myrow_name == name_shown) {
            no_quote_tweat = noQuoteTweat(myrow_tweat);

// X button to delete Tweat
            res.write("&nbsp;&nbsp;&nbsp;<span style='color:black;background-color:red' onclick='if (confirm(\"Are you sure you want to delete this Tweat?:\\n  " + 
            no_quote_tweat + "...\")) {window.open(\"/delete_tweat/\" + " + tid + ");}'>&nbsp;X&nbsp;</span>");
          }
          res.write("</td></tr>");
        }
      }
      var date = new Date();
      t = date.getTime();
      res.end("</table></body></html>");
      client.end();
    }
  });
});

app.get('/delete_tweat/:tid', function(req, res) {
/**
 * Delete Tweat.
 */
  tid = req.params.tid;
  delete_tweat(req, res);
  message = "";
  return;
});

app.get('/user/signout', function(req, res) {
/**
 * Sign user out.
 */
  cookies = new Cookies(req, res);
  res.cookie('user_name', '');
  res.cookie('password', '');
  res.cookie('stay_logged_in', 'off');
  writeHeadHTML(res);
  res.end(signout_html);
});

app.get('/stay_logged_on', function(req, res) {
/**
 * Set cookies for user to remain signed in.
 */
  cookies = new Cookies(req, res);
  var date = new Date();
  date.setTime(date.getTime() + (86400000 * 365 * 67));
  res.cookie('user_name', user_name, {expires: date});
  res.cookie('password', password, {expires: date});
  res.cookie('stay_logged_in', 'on', {expires: date});

  writeHeadHTML(res);
  res.end("<!DOCTYPE html><html><head><title>Remaining Signed In</title><link rel='shortcut icon' " + 
    "href='/users/favicon.png' type='image/png'><body onload=\"alert('You\\'ll now " + 
    "remain signed in.');window.close();\"><h1><b style='font-size:" + 
    "72px;color:red;background-color:violet'>&nbsp;Tweater&nbsp;</b></h1><h1 style='text-align:center'>" +
    "<a href='/' onclick=\"location.replace('/');\">If you're not redirected to Tweater in a few " +
    "seconds, please click here.</a></h1></body></html>");
});

app.get('/help', function(req, res) {
/**
 * Display Tweater help page.
 */
  writeHeadHTML(res);
  res.end('<!DOCTYPE html><html><head><title>Tweater Help</title><link rel="shortcut icon" ' + 
    'href="/users/favicon.png" type="image/png"><link rel="stylesheet" ' + 
    'href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css"><link rel="stylesheet" ' + 
    'href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">' + 
    '<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script>' + 
    '<body style="background-color:#99D9EA;font-size:' + font_size + 'px"><div><a href="' + SELF_NAME + 
    '" style="font-size:' + bigfont + 'px;color:red;background-color:#990099"><b>&nbsp;Tweater Help&nbsp;' + 
    '</b></a></div><img src="/users/tweatyquestion.png" style="float:right" />' + help_html);
});

app.get('/upload_picture', function(req, res) {
/**
 * Display picture upload form.
 */
  writeHeadHTML(res);
  res.end(upload_picture_html);
  return;
});

app.post('/upload_picture_uploading', function(req, res) {
/**
 * Process picture uploading.
 */
  upload_picture_uploading(req, res);
});

app.post('/post_tweat', function(req, res) {
/**
 * Post new Tweat to database.
 */
  var tweat_post = req.body;
  tweat = tweat_post.tweat;

  if (tweat) {
    cookies = new Cookies(req, res);
    var date = new Date();
    res.cookie("chat_timeout", (date.getTime() + 300000));
    writeHeadHTML(res);
    post_tweat(req, res);
  }
  message = "";
  return;
});

app.post('/user/signin', function(req, res) {
/**
 * Sign user in.
 */
  var given_user = req.body;
  given_user.user_name = given_user.user_name.trim().toLowerCase().replace(/\s+/g, " ").replace("%40","@");
  message = "";
  forgot_password = given_user.forgot_password;
// Forgotten password, so email password reset code if email address exists or username appears to be email
  if (forgot_password == "on") {
    user_name = given_user.user_name;
    password_forgotten(req, res);
    return;
  }
  if (!given_user.user_name || !given_user.password) {
    message += "Error: Both the password and username are required. "
  }
  user_name = given_user.user_name;
  password = given_user.password.replace("%40","@");
  password_hash = passwordHash(password);
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
  if (message !="") {
    sign_in_or_register(req, res, message);
    return;
  }
// Successful sign-in
  stay_logged_in = given_user.stay_logged_in;
  status = user.admin_status;
  name = user.name;
  interests = user.interests || "";
  cookies = new Cookies(req, res);

  if (stay_logged_in == "on") {
// Set cookies to remain signed in.
    var date = new Date();
    date.setTime(date.getTime() + (86400000 * 365 * 67));
    res.cookie('user_name', user_name, {expires: date});
    res.cookie('password', password, {expires: date});
    res.cookie('stay_logged_in', 'on', {expires: date});
  } else {
// Set session cookies to be deleted
    res.cookie('user_name', user_name);
    res.cookie('password', password);
    res.cookie('stay_logged_in', 'off');
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
  writeHeadHTML(res);
  res.end("<!DOCTYPE html><html><head><title>Tweater</title><body onload=\"location.replace('/');\"><h1><b style='font-size:" + 
    "72px;color:red;background-color:violet'>&nbsp;Tweater&nbsp;</b></h1><h1 style='text-align:center'>" +
    "<a href='/' onclick=\"location.replace('/');\">If you're not redirected to Tweater in a few seconds" +
    ", please click here.</a></h1></body></html>");
});

app.post("/info_update", function(req, res) {
/**
 * Update information and interests.
 */
  cookies = new Cookies(req, res);
  user_name = cookies.get('user_name').replace("%40", "@");
  password = cookies.get('password').replace("%40", "@");
  password_hash = passwordHash(password);
  user = _.find(users, function(u) {
    return u.user_name == user_name;
  });
  interests = req.body.interests;
  var client8 = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
  client8.query("USE " + DATABASE_NAME);
  client8.query("SELECT * FROM " + DATABASE_TABLE + 
    " WHERE ((user_name = ?) OR (email = ?)) AND (binary password_hash = ?)", [user_name, user_name, password_hash], function (err8, results8, fields8) {
    if (err8) {
      throw err8;
    }
    if (!results8.length) {
      writeHeadHTML(res);
      res.end("<!DOCTYPE html><html><head><meta charset='utf-8' /><title>Error!</title></head><body style='background-color:#99D9EA;padding:8px;" + 
      "font-family:" + font + ";font-size:" + font_size + "px'>Sorry, something went wrong! The information was not updated!</body></html>");
      return;
    }
    row_interests = results8[0]['interests'] || "";

    if ((interests == "") || (!interests)) { // No info given
      interests == "";
      interests_names = "  " + user_name + " " + name + " ";
      var client = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
      client.query("USE " + DATABASE_NAME);
      client.query("UPDATE " + DATABASE_TABLE + " SET interests = NULL, interests_words = ? " + 
        "WHERE ((user_name = ?) OR (email = ?)) AND (binary password_hash = ?)", [interests_names, user_name, user_name, password_hash], function (err, results, fields) {
        if (err) {
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
        client.end();
      });
    } else { // Update info and interests
      var client = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
      client.query("USE " + DATABASE_NAME);
      try {
        var result = utf8.decode(interests);
        client.query("SET NAMES 'utf8'");
      } catch (e) {
      }
      client.query("UPDATE " + DATABASE_TABLE + " SET interests = ? " + 
        "WHERE ((user_name = ?) OR (email = ?)) AND (binary password_hash = ?)", [interests, user_name, user_name, password_hash], function (err, results, fields) {
        if (err) {
          throw err;
        } else {
          var client2 = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
          client2.query("USE " + DATABASE_NAME);
          client2.query("SELECT * FROM " + DATABASE_TABLE + 
            " WHERE ((user_name = ?) OR (email = ?)) AND (binary password_hash = ?)", [user_name, user_name, password_hash], function (err2, results2, fields2) {
            if (err2) {
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
  
            try {
              var result = utf8.decode(old_interests);
              client3.query("SET NAMES 'utf8'");
            } catch (e) {
            }
    
            try {
              var result = utf8.decode(new_interests);
              client3.query("SET NAMES 'utf8'");
            } catch (e) {
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
              for (var new_item = 0; new_item < new_interests_array.length; new_item++) {
                if (new_interests_array[new_item] == " ") {
                  continue;
                }
                if ((new_interests_array[new_item].length > 0) && (old_interests.indexOf(" " + new_interests_array[new_item] + " ") == -1)) {
  
                  client4.query("INSERT INTO interests (id, user_name, interest) values(NULL, ?,?)", [user_name, new_interests_array[new_item] ], function (err4, results4, fields4) {
                    if (err4) {
                      throw err4;
                    } else {
                    }
                  });
                }
              }
              client4.end();
  
// Delete old obsolete interests from database
              var client5 = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
              client5.query("USE " + DATABASE_NAME);
  
              for (var old_item = 0; old_item < old_interests_array.length; old_item++) {
                if (old_interests_array[old_item] == " ") {
                  continue;
                }
                if ((old_interests_array[old_item].length > 0) && (new_interests.indexOf(" " + old_interests_array[old_item] + " ") == -1)) {
                  client5.query("DELETE FROM interests WHERE user_name = ? AND interest = ?", [user_name, old_interests_array[old_item] ], function (err5, results5, fields5) {
                    if (err5) {
                      throw err5;
                    } else {
                    }
                  });
                }
              }
              client5.end();
              user.interests = interests;
              user.interests_words = new_interests;
              message = "Interests and Information updated!";
              writeHeadHTML(res);
              show_home_page(req, res);
            });
          });
        }
        client.end(); 
      });
    } 
  });
  return;
});

app.post('/user/new', function(req, res) {
/**
 * Add new user.
 */
  var user = req.body;
  user.user_name = user.user_name.trim().toLowerCase().replace(/\s+/g, " ").replace("%40", "@");
  user.name = user.name.trim().replace(/\s+/g, " ").replace("%40", "@");
  message = "";
  if (!user.user_name || !user.name) {
    message += "Error: Both the name and username are required. "
  }
  var existing = _.findWhere(users, {user_name: user.user_name}); 
  if (existing) {
    message += "Error: The username \"" + user.user_name + "\" already exists. Please choose another username. "
  }
  if (user.user_name.indexOf("/") != -1) {
    message += "Error: The username cannot contain a slash. "
  }
  if (user.name.indexOf("/") != -1) {
    message += "Error: The name cannot contain a slash. "
  }
  if (user.new_user_password.length < 6) {
    message += "Error: The password must have at least six characters. "
  }
  if (user.new_user_password != user.password_confirm) {
    message += "Error: The password confirmation doesn't match the password. "
  }
  if (parseInt(user.answer_added.trim()) != parseInt(user.given_added.trim())) {
    message += "Error: The answer to the math question wasn't correct. You may try again with a new question below. "
  }
  if (message) { // Registration Failure
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
  user_name = user.user_name;
  password = user.new_user_password.replace("%40","@");
  password_hash = passwordHash(password);
  name = user.name.trim().replace(/\+/g, " ").replace(/\s+/g, " ").replace(/%2B/g, "+");
  user.password = password;
  user.password_hash = password_hash;
  user.name = name;
  users.push(user);
  cookies = new Cookies(req, res);
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
            if (interests_array[item] == " ") {
              continue;
            }
            if (interests_array[item].length > 0) {
              client5.query("INSERT INTO interests (id, user_name, interest) values(NULL, ?,?)", [user_name, interests_array[item] ], function (err5, results5, fields5) {
                if (err5) {
                  throw err5;
                }
              });
            }
          }
          client5.end();
// Set session cookies
          res.cookie('user_name', user_name);
          res.cookie('password', password);
          writeHeadHTML(res);
          show_home_page(req, res);
        }
      });
    }
  });
  return;
});

app.get('/hashtag_search_results/:hashtag', function(req, res) {
/**
 * Display Hashtag Search Results.
 */
  cookies = new Cookies(req, res);
  getFont();  
  if (cookies.get('shown_limit')) {
    shown_limit = cookies.get('shown_limit');
  } else {
    shown_limit = SHOWN_LIMIT_INITIAL;
  }
  
  hashtag = req.params.hashtag;
  hashtag_win = hashtag;
  hashtag = hashtag.replace(/\*/g, "%");
  hashtag = hashtag.replace(/\?/g, "_");
  user_name = cookies.get('user_name').replace("%40","@");
  password = cookies.get('password').replace("%40","@");
  password_hash = passwordHash(password);
  user = _.find(users, function(u) {
    return u.user_name == user_name;
  });
  admin = false;
  if (user) {
    if ((user.admin_status == 1) && (password_hash == user.password_hash)) {
      admin = true;
    }
  }
  writeHeadHTML(res);
  res.write("<!DOCTYPE html><html><head><meta charset='utf-8' /><title>Hashtag Search Results for " + 
    hashtag_win + "</title><link rel='shortcut icon' href='/users/favicon.png' type='image/png'>" + 
    "<script src='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js'>" + 
    "</script><script src='https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js'></script>" + 
    "<script><!--" + 
    "(document).ready(function(){\n" + 
    "  ('img').mousedown(function(){\n" +
    "    (this).animate({opacity: '0.5'},100);\n" +
    "  });\n" +
    "});\n" +
    "//--></script><style>.user{vertical-align:middle}</style>" +
    "</head><body style='color:black;background-color:#C0C0F0;padding:8px;font-family:" + font + 
    ";font-size:" + font_size + "px'>");
  
  if (!hashtag) {
    res.end("<div style='color:red'>No hashtag was given to search for!</div></body></html>");
    return;
  } else {
    var client = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
    client.query("USE " + DATABASE_NAME);
    client.query("SET NAMES 'utf8'");
    if ((hashtag.indexOf("%") >= 0) || (hashtag.indexOf("_") >= 0)) {
      var compare = "LIKE";
    } else {
      var compare = "=";
    }
    client.query("SELECT t.id, t.user_name, t.tweat, t.hashtag, u.name FROM tweats AS t " + 
      "INNER JOIN users AS u ON t.user_name = u.user_name WHERE (t.hashtag " + compare + " ?) AND " + 
        "(SUBSTRING(t.hashtag FROM 1 FOR 3) != 'DEL') ORDER BY t.id DESC LIMIT ?", [hashtag, parseInt(shown_limit)], function (err, results, fields) {
      if (err) {
        throw err;
      }
      if (!results) {
        res.write("<p>No Tweats found with the hashtag \"" + hashtag_win + "\". <br />Are you sure you " +
          "spelled it right? (Don't worry about capitalizing.) <br />You might try some other form " +
          "of the word, such as a singular or plural.</p>");
      } else {
        var num_rows = results.length;
        res.write("<h2>" + num_rows + " Hashtag Search Results for \"" + hashtag_win + "\"<br />" +
        "(Note: Wildcards ? and * may be used):</h2><ul>");
        for (ii = 0; ii < results.length; ii++) {
          var vname = results[ii]['name'];
          var vuname = results[ii]['user_name'];
          var tweat = results[ii]['tweat'];
          var tid = results[ii]['id'];
          res.write("<li><img src='/users/follow.png' class='user' onclick='window.open(\"/follow/" + vuname + "/" + 
            vname + "\");' />&nbsp;&nbsp;<a style='a:link{color:#000000};a:vlink{color:#990099};" + 
            "a:alink{color:#999900};a:hlink{color:#000099};' href='/view_user_name/" + vuname + 
            "' target='_blank'>" + vname + ":</a>&nbsp;&nbsp;" + tweat);

// X button for administrator to delete Tweat
          if (admin) {
            no_quote_tweat = noQuoteTweat(tweat);
            res.write("&nbsp;&nbsp;<img src='/users/xdel.png' style='position:relative;top:7px' onclick='" + 
              "if (confirm(\"Are you sure you want to delete this Tweat?:\\n  " + no_quote_tweat + 
              "...\")) {window.open(\"/delete_tweat/" + tid + "\");}' />");
          }
          res.write("</li>");
        }
      }
      client.end();
      res.end("</ul></body></html>");
    });  
  }
});

app.post('/user_search_results', function(req, res) {
/**
 * Search for other users by any information and interests. If multiple search terms are 
 * given, the terms are joined with a boolean OR.
 */
  var search_any = req.body.search_any;
  cookies = new Cookies(req, res);
  getFont();  
  if (cookies.get('shown_limit')) {
    shown_limit = cookies.get('shown_limit');
  } else {
    shown_limit = SHOWN_LIMIT_INITIAL;
  }
  
  user_name = cookies.get('user_name').replace("%40","@");
  password = cookies.get('password').replace("%40","@");
  password_hash = passwordHash(password);
  user = _.find(users, function(u) {
    return ((u.user_name == user_name) && (u.password_hash == password_hash));
  });
  admin = false;
  if (user) {
    if ((user.admin_status == 1) && (password_hash == user.password_hash)) {
      admin = true;
    }
  }
  if ((search_any == "") || (!search_any)) {
    all_users_display(req, res);
    return;
  }
  writeHeadHTML(res);
  res.write("<!DOCTYPE html><html><head><meta charset='utf-8' /><title>User Search Results</title>" +
    "<link rel='shortcut icon' href='/users/favicon.png' type='image/png'>" +
    "<script src='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js'></script>" +
    "<script src='https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js'></script>" +
    "<script><!--" +
    "(document).ready(function(){\n" +
      "('img').mousedown(function(){\n" +
        "(this).animate({opacity: '0.5'},100);\n" +
    "  });\n" +
    "});\n" +
    "//--></script>\n" +
    "<style>.user{vertical-align:middle}</style></head><body style='color:black;background-color:#C0C0F0;" + 
    "padding:8px;font-family:" + font + ";font-size:" + font_size + "px'><h2>User Interests and Information " + 
    "Search Results (Limit " + shown_limit + "):</h2><ul>");

  search_any = search_any.toLowerCase().substr(0,250).replace("-", " ");
  search_any = strtran(search_any, ',;+&/', '     ').trim();
  search_any = search_any.replace(/ +/g, " ");
  search_any_array = search_any.split(" ");
// Create array of unique search terms
  search_any_array = search_any_array.filter(function(item, i, ar){return ar.indexOf(item) === i;});
  search_any = "  " + search_any + " ";
  if (search_any_array.length > 10) {
    res.end("Sorry, there's a limit of 10 search words!</body></html>");
    return;
  }
  var client = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
  client.query("USE " + DATABASE_NAME);
  client.query("SET NAMES 'utf8'");
  var report_count = 0;
  var terms_found_count = 0;
  var cases_count = 0;
  var all_items = "";
  var not_found = false;
  for (var search_item in search_any_array) {
    all_items += " / " + search_any_array[search_item];
    client.query("SELECT i.id, i.user_name, i.interest, u.name, u.id as uid FROM interests AS i " +
      "INNER JOIN users AS u ON i.user_name = u.user_name WHERE i.interest = ? " + 
      "ORDER BY i.interest LIMIT ?", [search_any_array[search_item], parseInt(shown_limit)], function (err, results, fields) {
      if (err) {
        report_count += 1;
        throw err;
      } else {
        if (results.length) {
          terms_found_count++;
          res.write("<h3>Search Word \"" + search_any_array[report_count] + "\":</h3>");
          var sublist_count = 0;
          for (var myrow = 0; myrow < results.length; myrow ++) {
            vname = results[myrow]['name'];
            vuname = results[myrow]['user_name'];
            uid = results[myrow]['uid'];
            sublist_count++;
            cases_count++;
            res.write("<li><img src='/users/follow.png' class='user' onclick='window.open(\"/follow/" + vuname + 
              "/" + vname + "\");' />&nbsp;&nbsp;<img src='/users/unfollow.png' class='user' onclick='" +
              "window.open(\"/unfollow/" + vuname + "/" + vname + "\");' />&nbsp;&nbsp;" +
              "<a style='a:link{color:#000000};a:vlink{color:#990099};a:alink{color:#999900};" +
              "a:hlink{color:#000099};' href='/view_user_name/" + vuname + 
              "' target='_blank'>" + vname +
              " (Username: " + vuname + ")</a>");
// X button for administrator to delete Tweat
            if (admin) {
              res.write("&nbsp;&nbsp;<img src='/users/xdel.png' class='user' onclick='if (confirm(\"Are you " +
                "sure you want to delete this user?:\\n  " + vname + " (Username: " + vuname + "; User ID: " +
                uid + ")\")) {window.open(\"/delete_listed_user/" + uid + "/" + vuname + "\")}' />");
            }
            res.write("</li>");
          }
          res.write("<br />Total users with \"" + search_any_array[report_count] + "\":  " + sublist_count);
        } else {
          not_found = true;
          res.write("<h3>Search word \"" + search_any_array[report_count] + "\":  Not found.</h3>");
        }
      }
      if ((all_items.indexOf("?") != -1) || (all_items.indexOf("*") != -1)) {
        res.write("<br />Note:&nbsp;&nbsp;The wildcards ? and * can only be used in Hashtag and Boolean " + 
          "Searches.<br />In a normal User Search like this one, the ? and * have their literal values,<br />" + 
          "since some search terms may include them.<br /><br />");
      }
      report_count += 1;
      if (report_count == search_any_array.length) {
        if (terms_found_count == 0) {
          res.write("None of the given words were found:<br />" + search_any + "<br /><br />You may want to " + 
          "check your spelling, or use other forms of the words,<br />such as singulars or plurals. (Don't " + 
          "worry about capitalizing.)");
        } else {
          res.write("<br /><br />Total cases found:  " + cases_count);
          res.write("<br />Total terms found:  " + terms_found_count);
          if (not_found) {
            res.write("<br />Note: If a given word was not found, you may want to check your spelling, or use " + 
              "another form of the word,<br />such as a singular or a plural. (Don't worry about capitalizing.)");
          }
        }
        res.end("</ul><br /><br /></body></html>");  
        client.end();
      }
    });
  }
});

app.post('/boolean_search_results', function(req, res) {
/**
 * Search for other users by any information and interests using a boolean search with 
 * at most two search terms connected by boolean AND, OR or NOT as chosen by the user.
 */
  cookies = new Cookies(req, res);
  getFont();  
  if (cookies.get('shown_limit')) {
    shown_limit = cookies.get('shown_limit');
  } else {
    shown_limit = SHOWN_LIMIT_INITIAL;
  }
  
  user_name = cookies.get('user_name').replace("%40","@");
  password = cookies.get('password').replace("%40","@");
  password_hash = passwordHash(password);
  user = _.find(users, function(u) {
    return u.user_name == user_name;
  });
  admin = false;
  if (user) {
    if ((user.admin_status == 1) && (password_hash == user.password_hash)) {
      admin = true;
    }
  }

  writeHeadHTML(res);
  res.write("<!DOCTYPE html><html><head><meta charset='utf-8' /><title>Boolean Search Results</title>" +
    "<link rel='shortcut icon' href='/users/favicon.png' type='image/png'>" +
    "<script src='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js'></script>" +
    "<script src='https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js'></script>" +
    "<script><!--" +
    "(document).ready(function(){\n" +
      "('img').mousedown(function(){\n" +
        "(this).animate({opacity: '0.5'},100);\n" +
    "  });\n" +
    "});\n" +
    "//--></script>\n" +
    "<style>.user{vertical-align:middle}</style></head><body style='color:black;background-color:#C0C0F0;" + 
    "padding:8px;font-family:" + font + ";font-size:" + font_size + "px'><h2>User Interests and Information " + 
    "Boolean Search Results (Limit " + shown_limit + "):</h2><ul>");
  
  var search_one = req.body.search_one;
  var search_two = req.body.search_two;
  var search_type = req.body.search_type;

  if ((search_type == "") || (!search_type)) {
    search_type = "AND";
  }
  if (!search_one) {
    search_one = "";
  } else {
    var search_one_win = search_one.replace(/\*/g, "%").replace(/\?/g, "_");
  }
  if (!search_two) {
    search_two = "";
    var search_two_win = "";
  } else {
    var search_two_win = search_two.replace(/\*/g, "%").replace(/\?/g, "_");
  }

  if (search_one == "") {
    res.end("<p style='color:red'>Error:  At least the first search term must be given for a Boolean Search." + 
      "</p></body></html>");
    return;
  }
  search_one = search_one.substr(0,250).toLowerCase().replace(/-+/g, " ");
  search_one = strtran(search_one, '_%?*', '  _%');
  search_one = strtran(search_one.trim(), '"(),-/:;<=>[]!^\`{|}~¡¦©«¬­®¯´¶¸»¿', '                        ' + 
    '                  ');
  search_one = search_one.replace(/ +/g, " ");
  var search_one_wild = strtran(search_one, '_%', '?*');
  search_one = "% " + search_one + " %";
  if (search_two != "") {
    search_two = search_two.substr(0,250).toLowerCase().replace(/-+/g, " ");
    search_two = strtran(search_two, '_%?*', '  _%');
    search_two = strtran(search_two.trim(), '"(),-/:;<=>[]!^\`{|}~¡¦©«¬­®¯´¶¸»¿', '                        ' + 
      '                  ');
    search_two = search_two.replace(/ +/g, " ");
    var search_two_wild = strtran(search_two, '_%', '?*');
    search_two = "% " + search_two + " %";
  } else {
    var search_two_wild  = "";
  }
      
  var client = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
  client.query("USE " + DATABASE_NAME);
  client.query("SET NAMES 'utf8'");
  if (search_two == "") {
    var boolean_query = "SELECT name, user_name, id as uid FROM users WHERE interests_words LIKE ? " + 
      "ORDER BY user_name LIMIT ?";
    var boolean_query_params = new Array(search_one, parseInt(shown_limit));
  } else if (search_type == "NOT") {
    var boolean_query = "SELECT name, user_name, id as uid FROM users WHERE ((interests_words LIKE ?) " + 
      "AND (interests_words NOT LIKE ?)) ORDER BY user_name LIMIT ?";
    var boolean_query_params = new Array(search_one, search_two, parseInt(shown_limit));
  } else {
    var boolean_query = "SELECT name, user_name, id as uid FROM users WHERE ((interests_words LIKE ?) " + 
      search_type + " (interests_words LIKE ?)) ORDER BY user_name LIMIT ?";
    var boolean_query_params = new Array(search_one, search_two, parseInt(shown_limit));
  }

  client.query(boolean_query, boolean_query_params, function (err, results, fields) {
    if (err) {
      throw err;
      return;
    } else {
      if (!results.length) {
        res.end("<h2>No users found with given search term(s): " + search_one_wild + " " + search_type + " " + 
          search_two_wild + "<br />You may want to check your spelling, or use other forms<br />of the words, " + 
          "such as singulars or plurals. (Don't worry about capitalizing.)</h2></body></html>");
        client.end();
        return;
      }

      var num_rows = results.length;
      if (search_one != search_two) {
        res.write("<h2>" + num_rows + " Boolean Interests and Information Search Results (Limit " + shown_limit +
          ") for \"" + search_one_wild + "\" " + search_type + " \"" + search_two_wild + "\" <br />(Note: " + 
          "Wildcards ? and * may be used):</h2><br /><ul>");
      } else {
        res.write("<h2>" + num_rows + " Boolean Interests and Information Search Results (Limit " + shown_limit + 
          ") for \"" + search_one_wild + "\" <br />(Note: Wildcards ? and * may be used):</h2><br /><ul>");    
      }
    
      for (var myrow = 0; myrow < results.length; myrow ++) {
        vname = results[myrow]['name'];
        vuname = results[myrow]['user_name'];
        uid = results[myrow]['uid'];
        res.write("<li><img src='/users/follow.png' class='user' onclick='window.open(\"/follow/" + vuname + 
          "/" + vname + "\");' />&nbsp;&nbsp;<img src='/users/unfollow.png' class='user' onclick='" +
          "window.open(\"/unfollow/" + vuname + "/" + vname + "\");' />&nbsp;&nbsp;" +
          "<a style='a:link{color:#000000};a:vlink{color:#990099};a:alink{color:#999900};" +
          "a:hlink{color:#000099};' href='/view_user_name/" + vuname + "' target='_blank'>" + vname +
          " (Username: " + vuname + ")</a>");
// X button for administrator to delete Tweat
        if (admin) {
          res.write("&nbsp;&nbsp;<img src='/users/xdel.png' class='user' onclick='if (confirm(\"Are you sure " +
            "you want to delete this user?:\\n  " + vname + " (Username: " + vuname + "; User ID: " +
            uid + ")\")) {window.open(\"/delete_listed_user/" + uid + "/" + vuname + "\")}' />");
        }
        res.write("</li>");
      }
    }
    res.end("</ul><br /><br /></body></html>");  
    client.end();
  });
});

app.get('/view_user_name/:user_name', function(req, res) {
/**
 * Display a chosen user's Public Page (profile).
 */
  cookies = new Cookies(req, res);
  user_name = cookies.get('user_name').trim().replace("%40","@");
  password = cookies.get('password').trim().replace("%40","@");
  password_hash = passwordHash(password);
  user = _.find(users, function(u) {
    return u.user_name == user_name;
  });
  var view_admin = false;
  if (user) {
    if ((user.admin_status == 1) && (password_hash == user.password_hash)) {
      view_admin = true;
    }
  }
  getFont();    
  if (cookies.get('shown_limit')) {
    shown_limit = cookies.get('shown_limit');
  } else {
    shown_limit = SHOWN_LIMIT_INITIAL;
  }
  
  writeHeadHTML(res);
  var view_user_name = req.params.user_name;
  if ((!view_user_name) || (view_user_name == "")) {
    view_name = "Nobody";
    view_user_name = "Not much to see here!";
    res.end("<!DOCTYPE html><html><head><meta charset='utf-8' /><title>" + view_name + "'s Tweater Page " + 
      "(Username: " + view_user_name + ")</title></head><body style='background-color:#99D9EA;padding:8px;" + 
      "font-family:" + font + ";font-size:" + font_size + "px'>Sorry, something went wrong!</body></html>");
    return;
  }

  view_user_name = view_user_name.toLowerCase().trim().replace(/\+/g, " ").replace(/\s+/g, " ").replace(/%40/g, "@").replace(/%2B/g, "+");

  var client = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
  client.query("USE " + DATABASE_NAME);
  client.query("SET NAMES 'utf8'");
  client.query("SELECT * FROM " + DATABASE_TABLE + " WHERE (user_name = ?) LIMIT 1", [view_user_name], function (err, results, fields) {
    if (err) {
      throw err;
    } else {
      if (results.length) {
        var view_name = results[0]['name'];
        var view_interests = results[0]['interests'] || "";
        if ((!results[0]['picture_ext']) || (results[0]['picture_ext'] == "")) {
          picture_url = "nophoto.jpg";
        } else {
          picture_url = results[0]['id'] + "." + results[0]['picture_ext'];
        }
        
        res.write("<!DOCTYPE html><html><head><meta charset='utf-8' /><title>" + view_name + 
          "'s Tweater Page (Username: " + view_user_name + ")</title>" +
"    <link rel='shortcut icon' href='/users/favicon.png' type='image/png'>" + 
"    <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css'>" + 
"    <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css'>" + 
"    <script src='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js'></script>" + 
"</head><body style='background-color:" + 
          "#99D9EA;padding:8px;font-family:" + font + ";font-size:" + font_size + "px'><h1><a href='/' " + 
          "style='font-size:" + bigfont + "px;color:red;background-color:violet'><b>&nbsp;&nbsp;&nbsp;Tweater" + 
          "&nbsp;&nbsp;&nbsp;</b></a><br /><br /><div style='text-shadow: 5px 5px 5px #007F00;'>" + view_name + "'s " + 
          "Tweater Page (" + view_user_name + ")&nbsp;&nbsp;<button type='button' class='btn btn-success' " +
          "onclick=\"location.replace('/follow/" + view_user_name + "/" + view_name + "');\">Follow</button>&nbsp;" + 
          "<button type='button' class='btn btn-danger' onclick=\"location.replace('/unfollow/" + view_user_name + 
          "/" + view_name + "');\">Unfollow</button></div></h1><br /><b>Interests and Information:&nbsp;&nbsp;" +
          "</b>" + view_interests + "<br /><br /><img id='picture' src='/users/" + picture_url + "' /><br />" + 
          "<br /><b>Tweats:</b><br /><br />");
  
        var client2 = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
        client2.query("USE " + DATABASE_NAME);
        client2.query("SET NAMES 'utf8'");
        client2.query("SELECT t.id as tid, t.user_name, t.tweat, u.id, u.name, u.picture_ext " + 
          "FROM tweats AS t INNER JOIN users AS u ON t.user_name = u.user_name WHERE t.user_name = ? " + 
          "ORDER BY t.id DESC LIMIT ?", [view_user_name, parseInt(shown_limit)], function (err2, results2, fields2) {
          if (err2) {
            throw err2;
          } else {
            if (results2.length) {
              for (var myrow = 0; myrow < results2.length; myrow ++) {
                if (results2[myrow]['name']) {
                  myrow_tweat = results2[myrow]['tweat'];
                  tid = results2[myrow]['tid'];
                } else {
                  myrow_tweat = "";
                  
                }
                res.write("<p>" + wordwrap(myrow_tweat, tweat_width, '<br />', true));
// Red X button for administrator to delete Tweat
                if (view_admin) {
                  no_quote_tweat = noQuoteTweat(myrow_tweat);
                  res.write("&nbsp;&nbsp;<img src='/users/xdel.png' style='position:relative;top:-2px' " + 
                    "onclick='if (confirm(\"Are you sure you want to delete this Tweat?:\\n  " + 
                    no_quote_tweat + "...\")) {window.open(\"/delete_tweat/" + tid + "\");}' />");
                }
                res.write("</p>");
              }
            } 
          } 
          res.end("</div></body></html>");
          client2.end();
        });
      } else {
        res.end("Sorry, something went wrong.</body></html>");
      } 
    }
    client.end();
  });
});

app.get('/follow/:vuname/:vname', function(req, res) {
/**
 * Follow another user.
 */
  cookies = new Cookies(req, res);
  user_name = cookies.get('user_name').trim().replace("%40","@");
  password = cookies.get('password').trim().replace("%40","@");
  password_hash = passwordHash(password);
  followed_one = req.params.vuname;
  followed_name = req.params.vname;
  user = _.find(users, function(u) {
    return ((u.user_name == user_name) && (u.password_hash == password_hash));
  });

  getFont();  
  writeHeadHTML(res);
  if (!user) {
    res.end("<!DOCTYPE html><html><head><meta charset='utf-8' /><title>Follow Error</title></head><body " + 
      "style='background-color:#99D9EA;padding:8px;" + 
      "font-family:" + font + ";font-size:" + font_size + "px'>Sorry, something went wrong! The user " + 
      followed_one + " is not followed! You may try again.</body></html>");
    return;
  }

  if (followed_one.length > 0) {
    var client = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
    client.query("USE " + DATABASE_NAME);
    client.query("SET NAMES 'utf8'");
    client.query("SELECT * FROM followed_ones WHERE user_name = ? AND followed_one = ?", [user_name, followed_one], function (err, results, fields) {
      if (err) {
        throw err;
      } else {
        if (results.length) {
          if (user_name == followed_one) {
            res.end("<!DOCTYPE html><html><head><title>Tweater Follow User Error</title><body onload=\"alert('" + 
              "Hey, you can\\'t follow YOURSELF! (I tried it once, and kept going in circles...)');" + 
              "window.close();\"><h1><b style='font-size:" + "72px;color:red;background-color:violet'>" + 
              "&nbsp;Tweater&nbsp;</b></h1><h1 style='text-align:center'><a href='/' " + 
              "onclick=\"location.replace('/');\">If you're not redirected to Tweater in a few seconds, " +
              "please click here.</a></h1></body></html>");
          } else {
            res.end("<!DOCTYPE html><html><head><title>Tweater Follow User Error </title><body onload=\"alert('" + 
              followed_name + "(" + followed_one + ") is already on your list of followed users.');" + 
              "window.close();\"><h1><b style='font-size:" + "72px;color:red;background-color:violet'>" + 
              "&nbsp;Tweater&nbsp;</b></h1><h1 style='text-align:center'><a href='/' " + 
              "onclick=\"location.replace('/');\">If you're not redirected to Tweater in a few seconds, " +
              "please click here.</a></h1></body></html>");
          }
          client.end();
          return;
        } else {
          client.end();
          var client2 = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
          client2.query("USE " + DATABASE_NAME);
          client2.query("SET NAMES 'utf8'");
          client2.query("INSERT INTO followed_ones (id, user_name, followed_one) VALUES (NULL, ?, ?)", [user_name, followed_one], function (err2, results2, fields2) {
            if (err2) {
              throw err2;
            } else {
            res.end("<!DOCTYPE html><html><head><title>Tweater Follow User</title><body onload=\"alert('" + 
              followed_name + " (" + followed_one + ") is now added to your list of followed users.');" + 
              "window.close();\"><h1><b style='font-size:" + "72px;color:red;background-color:violet'>" + 
              "&nbsp;Tweater&nbsp;</b></h1><h1 style='text-align:center'><a href='/' " + 
              "onclick=\"location.replace('/');\">If you're not redirected to Tweater in a few seconds, " +
              "please click here.</a></h1></body></html>");
            }
          });
        }
      }
    });
  } else {
    res.end("<!DOCTYPE html><html><head><meta charset='utf-8' /><title>Follow Error</title></head><body " + 
      "style='background-color:#99D9EA;padding:8px;" + 
      "font-family:" + font + ";font-size:" + font_size + "px'>Sorry, something went wrong! The user " + 
      followed_one + " is not followed! You may try again.</body></html>");
  }
});

app.get('/unfollow/:vuname/:vname', function(req, res) {
/**
 * Unfollow another user.
 */
  cookies = new Cookies(req, res);
  user_name = cookies.get('user_name').trim().replace("%40","@");
  password = cookies.get('password').trim().replace("%40","@");
  password_hash = passwordHash(password);
  followed_one = req.params.vuname;
  followed_name = req.params.vname;
  user = _.find(users, function(u) {
    return ((u.user_name == user_name) && (u.password_hash == password_hash));
  });

  getFont();  
  writeHeadHTML(res);
  if (!user) {
    res.end("<!DOCTYPE html><html><head><meta charset='utf-8' /><title>Unfollow Error</title></head><body " + 
      "style='background-color:#99D9EA;padding:8px;" + 
      "font-family:" + font + ";font-size:" + font_size + "px'>Sorry, something went wrong! The user " + 
      followed_one + " is not unfollowed! You may try again.</body></html>");
    return;
  }

  if (followed_one.length > 0) {
    var client = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
    client.query("USE " + DATABASE_NAME);
    client.query("SET NAMES 'utf8'");
    client.query("SELECT * FROM followed_ones WHERE user_name = ? AND followed_one = ?", [user_name, followed_one], function (err, results, fields) {
      if (err) {
        throw err;
      } else {
        if (results.length) {
          client.end();
          if (user_name == followed_one) {
            res.end("<!DOCTYPE html><html><head><title>Tweater Unfollow User Error</title><body onload=\"alert(" + 
              "'Hey, you can\\'t unfollow YOURSELF! (I tried it once, and couldn\\'t find my shadow!)');" + 
              "window.close();\"><h1><b style='font-size:" + "72px;color:red;background-color:violet'>" + 
              "&nbsp;Tweater&nbsp;</b></h1><h1 style='text-align:center'><a href='/' " + 
              "onclick=\"location.replace('/');\">If you're not redirected to Tweater in a few seconds, " +
              "please click here.</a></h1></body></html>");
            return;
          }
          var client2 = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
          client2.query("USE " + DATABASE_NAME);
          client2.query("SET NAMES 'utf8'");
          client2.query("DELETE FROM followed_ones WHERE user_name = ? AND followed_one = ? AND user_name != followed_one", [user_name, followed_one], function (err2, results2, fields2) {
            if (err2) {
              throw err2;
            } else {
              client2.end();
              res.end("<!DOCTYPE html><html><head><title>Tweater Unfollow User</title><body onload=\"alert('" + 
                followed_name + " (" + followed_one + ") is now removed from your list of followed users. " +
                "(Don\\'t worry, I won\\'t tell " + followed_name + ". The news would be crushing!)');" + 
                "window.close();\"><h1><b style='font-size:" + "72px;color:red;background-color:violet'>" + 
                "&nbsp;Tweater&nbsp;</b></h1><h1 style='text-align:center'><a href='/' " + 
                "onclick=\"location.replace('/');\">If you're not redirected to Tweater in a few seconds, " +
                "please click here.</a></h1></body></html>");
            }
          });
        } else {
          client.end();
            res.end("<!DOCTYPE html><html><head><title>Tweater Unfollow User Error</title><body onload=\"alert(" + 
              "'You can\\'t unfollow someone that you\\'re not following! It boggles the mind too much...');" + 
              "window.close();\"><h1><b style='font-size:" + "72px;color:red;background-color:violet'>" + 
              "&nbsp;Tweater&nbsp;</b></h1><h1 style='text-align:center'><a href='/' " + 
              "onclick=\"location.replace('/');\">If you're not redirected to Tweater in a few seconds, " +
              "please click here.</a></h1></body></html>");
        }
      }
    });
  } else {
    res.end("<!DOCTYPE html><html><head><meta charset='utf-8' /><title>Unfollow Error</title></head><body " + 
      "style='background-color:#99D9EA;padding:8px;" + 
      "font-family:" + font + ";font-size:" + font_size + "px'>Sorry, something went wrong! The user " + 
      followed_one + " is not unfollowed! You may try again.</body></html>");
  }
});

app.get('/change_password', function(req, res) {
/**
 * Display password change form.
 */
  getFont();  
  writeHeadHTML(res);
  res.end("<!DOCTYPE html><html><head><title>Tweater Password Change</title>" +
    "<link rel='shortcut icon' href='/users/favicon.png' type='image/png'>" +
    "<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css'>" +
    "<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css'>" +
    "<script src='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js'></script>" +
    "<style>.center {margin-left: auto;margin-right: auto;width: 20%;background-color: #ee6600;}</style></head>" +
    "<body style='color:black;background-color:#c0c0f0;padding:8px;" +
    "font-family:" + font + ",Courier New;font-size:" + bigfont + "px'><div class='center'><p>&nbsp;&nbsp;" +
    "Tweater Account&nbsp;</p><p>&nbsp;Password Change:&nbsp;</p><span><form action='/new_password' " +
    "method='POST' autocomplete='off'>" +
    "<div><fieldset class='fieldset-auto-width' style='float:left'><input type='text' style='display:none'>" +
    "<input type='password' style='display:none'><div class='input-group'><input type='password' " +
    "class='form-control' placeholder='Old Password' name='old_password' autocomplete='off' size='32'></div>" +
    "<div class='input-group'><input type='password' class='form-control' placeholder='New Password' " + 
    "name='new_password' autocomplete='off' size='32'></div><div class='input-group'>" +
    "<input type='password' class='form-control' placeholder='Confirm New Password' name='password_confirm' " + 
    "autocomplete='off' size=32></div><button type='submit' class='btn btn-success'>Change Password</button>" +
    "</fieldset></div></span></form></div></body></html>");
});

app.post('/new_password', function(req, res) {
/**
 * Process changing password.
 */
  cookies = new Cookies(req, res);
  user_name = cookies.get('user_name').trim().replace("%40","@");
  old_password = req.body.old_password.trim().replace("%40","@");
  new_password = req.body.new_password.trim().replace("%40","@");
  password_confirm = req.body.password_confirm.trim().replace("%40","@");
  old_password_hash = passwordHash(old_password);
  new_password_hash = passwordHash(new_password);
  user = _.find(users, function(u) {
    return ((u.user_name == user_name) && (u.password_hash == old_password_hash));
  });

  getFont();  
  if (!user) {
    writeHeadHTML(res);
    res.end("<!DOCTYPE html><html><head><meta charset='utf-8' /><title>Password Change Error</title></head>" + 
      "<body style='background-color:#99D9EA;padding:8px;font-family:" + font + ";font-size:" + font_size + 
      "px'>Sorry, the old password given is not correct! Remember that passwords are case-sensitive. You may " +
      "try again to change your password.</body></html>");
    return;
  }
  if (new_password != password_confirm) {
    writeHeadHTML(res);
    res.end("<!DOCTYPE html><html><head><meta charset='utf-8' /><title>Password Change Error</title></head>" + 
      "<body style='background-color:#99D9EA;padding:8px;font-family:" + font + ";font-size:" + font_size + 
      "px'>Sorry, the new password given does not match the password confirmation given! Remember that " +
      "passwords are case-sensitive. You may try again to change your password.</body></html>");
    return;
  }
  if (new_password.length < 6) {
    writeHeadHTML(res);
    res.end("<!DOCTYPE html><html><head><meta charset='utf-8' /><title>Password Change Error</title></head>" + 
      "<body style='background-color:#99D9EA;padding:8px;font-family:" + font + ";font-size:" + font_size + 
      "px'>Sorry, the new password given isn't long enough. It must have at least 6 characters. You may try " +
      "again to change your password.</body></html>");
    return;
  }

  var client = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
  client.query("USE " + DATABASE_NAME);
  client.query("SET NAMES 'utf8'");
  client.query("UPDATE " + DATABASE_TABLE + " SET password_hash = ? WHERE user_name = ? AND password_hash = ?", [new_password_hash, user_name, old_password_hash], function (err, results, fields) {
    if (err) {
      throw err;
    } else {
      var client2 = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
      client2.query("USE " + DATABASE_NAME);
      client2.query("SET NAMES 'utf8'");
      client2.query("SELECT * from " + DATABASE_TABLE + " WHERE user_name = ? AND password_hash = ?", [user_name, new_password_hash], function (err2, results2, fields2) {
        if (err2) {
          throw err2;
        } else {
          if (!results2[0]['user_name']) {
            writeHeadHTML(res);
            res.end("<!DOCTYPE html><html><head><meta charset='utf-8' /><title>Password Change Error</title>" + 
              "</head><body style='background-color:#99D9EA;padding:8px;font-family:" + font + ";font-size:" +
              font_size + "px'>Sorry, your password has not been changed. Remember that passwords are " +
              "case-sensitive, and be sure your caps lock isn't on.</body></html>");
            client2.end();
            return;
          }
          var date = new Date();
          if (cookies.get('stay_logged_in') == "on") {
            date.setTime(date.getTime() + (86400000 * 365 * 67));
          } else {
            date.setTime(date.getTime());
          }
          res.cookie('user_name', user_name, {expires: date});
          res.cookie('password', new_password, {expires: date});
          user.password_hash = new_password_hash;

          email = results2[0]['email'];
          if ((!email) && (results2[0]['user_name'].indexOf("@") > 0) && (results2[0]['user_name'].indexOf(".") > results2[0]['user_name'].indexOf("@") + 1)) {
            email = results2[0]['user_name'];
          }
          if (email) {
            transporter.sendMail({from: 'Tweater <davareno58@gmail.com>', to: email, subject: 
              results2[0]['name'] + ', your Tweater password has been changed',
              html: '<html><body style="background-color:#99D9EA;padding:8px;font-family:' + font + 
              ';font-size:' + font_size + 'px">Hello ' + results2[0]['name'] + ',<br /><br />' + 
              '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Your Tweater account password has just been changed. If this was ' +
              'not done by you, you may let us know at crandadk@aol.com<br /><br />' + 
              '<a href="http://' + DATABASE_HOST + '/' + '" style="font-size:40px;color:red;' + 
              'background-color:violet;float:left;text-decoration:none"><b>&nbsp;Tweater&nbsp;</b></a>' + 
              '&nbsp;&nbsp;&nbsp;&nbsp;' + tweamail + '<br /><br /><br /><br /><br /><br /><br /><br /><br />' + 
              '<br /><br /><br /><br /><br /><br /><br /><br /><br /><hr />How to unsubscribe to Tweat ' + 
              'Notifications:<br /><br />If you don\'t want to receive Tweat Notifications, ' + 
              'sign in to <a href="http://' + DATABASE_HOST + '/">your Tweater ' + 
              'Account</a> and click on the Tweat Notifications button at the left. ' + 
              'A pop-up prompt will appear. Type the word No and click on OK.'});
          }
          writeHeadHTML(res);
          res.end("<!DOCTYPE html><html><head><meta charset='utf-8' /><title>Password Changed!</title>" +
            "<link rel='shortcut icon' href='/users/favicon.png' type='image/png'></head>" + 
            "<body style='background-color:#99D9EA;padding:8px;font-family:" + font + ";font-size:" + font_size +
            "px'>Your password has been changed to the new password given. <a href='/'>Please click <b>here</b>" +
            " to return to your Home page.</a></body></html>");
          client2.end();
        }
      });
      client.end();
    }
  });
});

app.get('/new_email_address', function(req, res) {
/**
 * Display new email address form.
 */
  getFont();  
  writeHeadHTML(res);
  res.end("<!DOCTYPE html><html><head><title>Tweater New Email Address</title>" +
    "<link rel='shortcut icon' href='/users/favicon.png' type='image/png'>" +
    "<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css'>" +
    "<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css'>" +
    "<script src='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js'></script>" +
    "<style>.center {margin-left: auto;margin-right: auto;width: 20%;background-color: #ee6600;}</style></head>" +
    "<body style='color:black;background-color:#c0c0f0;padding:8px;'><div style='" +
    "font-family:" + font + ",Courier New;font-size:" + bigfont + "px'><div class='center'><p>&nbsp;&nbsp;" +
    "&nbsp;Tweater Account&nbsp;</p><p>&nbsp;New Email Address:</p><span><form action='/new_email' " +
    "method='POST' autocomplete='off'>" +
    "<div><fieldset class='fieldset-auto-width' style='float:left'><input type='text' style='display:none'>" +
    "<input type='password' style='display:none'><div class='input-group'><input type='text' " +
    "class='form-control' placeholder='New Email Address' name='email' autocomplete='off' size='50'></div>" +
    "<div class='input-group'><input type='text' class='form-control' placeholder='Confirm Email Address' " +
    "name='email_confirm' autocomplete='off' size='50'></div><div class='input-group'><input type='password' " +
    "class='form-control' placeholder='Password' name='password' autocomplete='off' size='32'></div>" +
    "<button type='submit' class='btn btn-success'>Submit New Email Address</button></fieldset></div></span>" +
    "</form></div></div><br /><br /><br /><br /><br /><br /><br /><br /><p class='center' style='font-size:" +
    font_size + "px;width:40%;padding:8px'>(If you want to delete your email address completely, leave the two " +
    "email address fields above blank, and just enter your password before clicking Submit.)</p></body></html>");
});

app.post('/new_email', function(req, res) {
/**
 * Processing new email address.
 */
  cookies = new Cookies(req, res);
  user_name = cookies.get('user_name').trim().replace("%40","@");
  email = req.body.email.trim().replace("%40","@") || null;
  email_confirm = req.body.email_confirm.trim().replace("%40","@") || null;
  password = req.body.password.trim().replace("%40","@");
  password_hash = passwordHash(password);

  user = _.find(users, function(u) {
    return ((u.user_name == user_name) && (u.password_hash == password_hash));
  });

  getFont();  
  if (!user) {
    writeHeadHTML(res);
    res.end("<!DOCTYPE html><html><head><meta charset='utf-8' /><title>New Email Error</title></head>" + 
      "<body style='background-color:#99D9EA;padding:8px;font-family:" + font + ";font-size:" + font_size + 
      "px'>Sorry, the password given is not correct! Remember that passwords are case-sensitive. You may " +
      "try again to enter your new email address.</body></html>");
    return;
  }
  if (email != email_confirm) {
    writeHeadHTML(res);
    res.end("<!DOCTYPE html><html><head><meta charset='utf-8' /><title>New Email Error</title></head>" + 
      "<body style='background-color:#99D9EA;padding:8px;font-family:" + font + ";font-size:" + font_size + 
      "px'>Sorry, the new email address given does not match the email address confirmation given! Remember " +
      "to type both exactly the same. You may try again to enter your new email address.</body></html>");
    return;
  }

  var old_email = user.email;
  var client = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
  client.query("USE " + DATABASE_NAME);
  client.query("SET NAMES 'utf8'");
  client.query("UPDATE " + DATABASE_TABLE + " SET email = ? WHERE user_name = ? AND password_hash = ?", [email, user_name, password_hash], function (err, results, fields) {
    if (err) {
      throw err;
    } else {
      var client2 = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
      client2.query("USE " + DATABASE_NAME);
      client2.query("SET NAMES 'utf8'");
      client2.query("SELECT * from " + DATABASE_TABLE + " WHERE user_name = ? AND password_hash = ?", [user_name, password_hash], function (err2, results2, fields2) {
        if (err2) {
          throw err2;
        } else {
          if (!results2[0]['user_name']) {
            writeHeadHTML(res);
            res.end("<!DOCTYPE html><html><head><meta charset='utf-8' /><title>New Email Address Error</title>" + 
              "</head><body style='background-color:#99D9EA;padding:8px;font-family:" + font + ";font-size:" +
              font_size + "px'>Sorry, your new email address has not been entered. You may try again.</body></html>");
            client2.end();
            return;
          }

          user.email = email;          
          if (old_email) {
            transporter.sendMail({from: 'Tweater <davareno58@gmail.com>', to: old_email, subject: 
              results2[0]['name'] + ', your Tweater Email Address has been changed',
              html: '<html><body style="background-color:#99D9EA;padding:8px;font-family:' + font + 
              ';font-size:' + font_size + 'px">Hello ' + results2[0]['name'] + ',<br /><br />' + 
              '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Your Tweater account email address has just been changed. ' +
              'If this was not done by you, you may let us know at crandadk@aol.com<br /><br />' + 
              '<a href="http://' + DATABASE_HOST + '/' + '" style="font-size:40px;color:red;' + 
              'background-color:violet;float:left;text-decoration:none"><b>&nbsp;Tweater&nbsp;</b></a>' + 
              '&nbsp;&nbsp;&nbsp;&nbsp;' + tweamail + '<br /><br /><br /><br /><br /><br /><br /><br /><br />' + 
              '<br /><br /><br /><br /><br /><br /><br /><br /><br /><hr />How to unsubscribe to Tweat ' + 
              'Notifications:<br /><br />If you don\'t want to receive Tweat Notifications, ' + 
              'sign in to <a href="http://' + DATABASE_HOST + '/">your Tweater ' + 
              'Account</a> and click on the Tweat Notifications button at the left. ' + 
              'A pop-up prompt will appear. Type the word No and click on OK.'});
          }
          writeHeadHTML(res);
          res.end("<!DOCTYPE html><html><head><meta charset='utf-8' /><title>New Email Address Entered!</title>" +
            "<link rel='shortcut icon' href='/users/favicon.png' type='image/png'>" + 
            "</head><body style='background-color:#99D9EA;padding:8px;font-family:" + font + ";font-size:" + 
            font_size + "px'>Your email address has been changed to " + email + ". <a onclick='window.close()' " +
            "href='' >Please click <b>here</b> to close this window.</a></body></html>");
          client2.end();
        }
      });
      client.end();
    }
  });
});

app.get('/change_notify/:enable', function(req, res) {
/**
 * Change Tweat Email Notifications preference.
 */
  if (req.params.enable == 'true') {
    tweat_notify = 1;
    message = "Tweat Notifications are now enabled.";
  } else {
    tweat_notify = 0;
    message = "Tweat Notifications are now DISABLED.";
  }
  user_name = cookies.get('user_name').trim().replace("%40","@");
  password = cookies.get('password').trim().replace("%40","@");
  password_hash = passwordHash(password);

  writeHeadHTML(res);
  user = _.find(users, function(u) {
    return ((u.user_name == user_name) && (u.password_hash == password_hash));
  });

  if (user) {
    var client4 = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
    client4.query("USE " + DATABASE_NAME);
    client4.query("SET NAMES 'utf8'");
    client4.query("UPDATE users SET tweat_notify = ? WHERE user_name = ? AND binary password_hash = ?" + 
      " LIMIT 1", [tweat_notify, user_name, password_hash], function (err4, results4, fields4) {
      if (err4) {
        res.end("<!DOCTYPE html><html><head><meta charset='utf-8' /><title>Tweat Notification Error</title>" + 
          "</head><body style='background-color:#99D9EA;padding:8px;font-family:" + font + ";font-size:" +
          font_size + "px'>ERROR: Tweat Notifications was not updated! Sorry, but something went wrong. " +
          "You may try again to change your Tweat Notifications. <a onclick='window.close()' " +
          "href='' >Please click <b>here</b> to close this window.</a></body></html>");

      } else {
        res.end("<!DOCTYPE html><html><head><meta charset='utf-8' /><title>Tweat Notifications Changed</title>" +
          "<link rel='shortcut icon' href='/users/favicon.png' type='image/png'>" + 
          "</head><body style='background-color:#99D9EA;padding:8px;font-family:" + font + ";font-size:" +
          font_size + "px'>" + message + " <a onclick='window.close()' " +
          "href='' >Please click <b>here</b> to close this window.</a></body></html>");
        user.tweat_notify = tweat_notify;
        message = "";
      }
      client4.end();
    });
  } else {
    res.end("<!DOCTYPE html><html><head><meta charset='utf-8' /><title>Tweat Notification Error</title></head>" + 
      "<body style='background-color:#99D9EA;padding:8px;font-family:" + font + ";font-size:" + font_size + 
      "px'>Sorry, the password given is not correct! Remember that passwords are case-sensitive. You may " +
      "try again to change your Tweat Notifications. <a onclick='window.close()' " +
      "href='' >Please click <b>here</b> to close this window.</a></body></html>");
  }
});

app.get('/user/unsubscribe', function(req, res) {
/**
 * Process request to unsubscribe.
 */
  cookies = new Cookies(req, res);
  user_name = cookies.get('user_name').trim().replace("%40","@");
  password = cookies.get('password').trim().replace("%40","@");
  password_hash = passwordHash(password);
  getFont();  

  var client = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
  client.query("USE " + DATABASE_NAME);
  client.query("DELETE FROM " + DATABASE_TABLE + " WHERE (user_name = ?) AND (BINARY password_hash = ?)", [user_name, password_hash], function (err, results, fields) {
    if (err) {
      message = "Sorry, something went wrong and you are not unsubscribed to Tweater. You may try again if you really want to go!";
      show_home_page(req, res);
     client.end();
    } else {
     client.end();
     var date = new Date();
     date.setTime(date.getTime() -  7200000);
     res.cookie('user_name', '', {expires: date}); // Set cookies to be deleted
     res.cookie('password', '', {expires: date});

// Display good-bye page
      res.end('<!DOCTYPE html><HTML><HEAD><TITLE>TWEATER UNSUBSCRIBE</TITLE>' + 
'<LINK rel="shortcut icon" href="/users/favicon.png" type="image/png"></HEAD>' + 
'<BODY style="background-color:#99D9EA;font-family:' + font + ';font-size:' + font_size + 'px">' + 
'<h1 style="text-align:center">Tweater: You are now unsubscribed to Tweater. Sorry to see you go!<br />' + 
'(Actually I\'m a computer and have no human feelings!)</h1><h2 style="text-align:center"><a href="' + SELF_NAME + 
'">Click here to sign in another user or register a new user.</a></h2><img src="/users/tweatysad.png" /></BODY></HTML>');
    }
    user = _.find(users, function(u) {
      return u.user_name == user_name;
    });
    users = _.reject(users, function(u){ return u.user_name == user_name;
    }); 
  });
});

app.get('/delete_listed_user/:uid/:vuname', function(req, res) {
/**
 * Administrator deletes a user account.
 */
  cookies = new Cookies(req, res);
  user_name = cookies.get('user_name').trim().replace("%40","@");
  password = cookies.get('password').trim().replace("%40","@");
  password_hash = passwordHash(password);
  user = _.find(users, function(u) {
    return u.user_name == user_name;
  });
  if (!user) {
    writeHeadHTML(res);
    res.end("<!DOCTYPE html><html><head><meta charset='utf-8' /><title>Error!</title></head><body style='background-color:#99D9EA;padding:8px;" + 
      "font-family:" + font + ";font-size:" + font_size + "px'>Sorry, something went wrong! The user was not deleted!</body></html>");
    return;
  }

  if ((user.admin_status != 1) || (password_hash != user.password_hash)) {
    writeHeadHTML(res);
    res.end("<!DOCTYPE html><html><head><meta charset='utf-8' /><title>User deletion denied!</title></head><body style='background-color:#99D9EA;padding:8px;" + 
      "font-family:" + font + ";font-size:" + font_size + "px'>Sorry, you cannot delete the user!</body></html>");
    return;
  }
  getFont();  

// Administrator deletes a listed user
  var del_user_id = req.params.uid;
  var del_user_uname = req.params.vuname;
  var client = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
  client.query("USE " + DATABASE_NAME);
  client.query("DELETE FROM " + DATABASE_TABLE + " WHERE id = ?", [del_user_id], function (err, results, fields) {
    if (err) {
      throw err;
    } else {
      writeHeadHTML(res);
      res.end("<!DOCTYPE html><html><head><title>Tweat Delete</title><body onload=\"alert('The account of " + 
        "Username " + del_user_uname + " (ID #" + del_user_id + ") has been deleted.');" + 
        "window.close();\"><h1><b style='font-size:" + 
        "72px;color:red;background-color:violet'>&nbsp;Tweater&nbsp;</b></h1><h1 style='text-align:center'>" +
        "<a href='/' onclick=\"location.replace('/');\">If you're not redirected to Tweater in a few seconds" +
        ", please click here.</a></h1></body></html>");
    }
    client.end();
  });
});

app.get('/:what', function(req, res) {
/**
 * Display 404 Page not found.
 */
  page_not_found_404(req, res);
});

app.get('/users/:what', function(req, res) {
/**
 * Display 404 Page not found.
 */
  page_not_found_404(req, res);
});

app.get('/pictures/:what', function(req, res) {
/**
 * Display 404 Page not found.
 */
  page_not_found_404(req, res);
});
          
function strtran(str, oldchars, newchars) {
/**
 * Translate given characters to other characters.
 * @param {string} str String to translate.
 * @param {string} oldchars List of characters to translate from.
 * @param {string} newchars List of characters to translate to. If longer than oldchars, extra characters are ignored.
 * @returns {string} with characters translated.
 */
  var newstr = "";
  for (var ii = 0; ii < str.length; ii++) {
    newstr += (oldchars.indexOf(str.charAt(ii)) == -1 ? str.charAt(ii) : newchars.charAt(oldchars.indexOf(str.charAt(ii))));
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
      throw err6;
    }
    var myrow4 = results6;
    followers_count = myrow4[0]['followers_count'] - 2 || 0;
    client6.end();

// List followed users with links to their pages
    var client7 = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
    client7.query("USE " + DATABASE_NAME);
    client7.query("SET NAMES 'utf8'");
    client7.query("SELECT DISTINCT u.name, u.id, f.followed_one FROM followed_ones AS f " + 
      "INNER JOIN users AS u ON f.followed_one = u.user_name WHERE f.followed_one IN " + 
      "(SELECT f.followed_one FROM followed_ones AS f WHERE f.user_name = ?) ORDER BY name", [user_name], function (err7, results7, fields7) {
      if (err7) {
        throw err7;
      } else {
        followed_ones_list = "";
        if (results7.length) {
          for (var myrow3 = 0; myrow3 < results7.length; myrow3++) {
            if (results7[myrow3]['followed_one'] != user_name) {
              followed_ones_list += "<option value='" + results7[myrow3]['followed_one'] + "'>" + 
                wordwrap(results7[myrow3]['name'], 30, '<br />', true) + " (" + 
                wordwrap(results7[myrow3]['followed_one'], 30, '<br />', true) + ")</option>";
            }
          }
        }
        client7.end();
      }
      esc_name = name.replace(" ", "+"); // Version of user's name with space(s) changed to + for GET querystring

// Adjust Chat Mode start/stop button and its action
      chat_setup();

      main_init(req, res); // Initialize user header HTML and user variables from cookies
   
      status="";
      unsubscribe_password = passwordHash(password);
      if (message) {
        formatted_message = '<div class="container" style="position:relative;top:-20px;margin:0px;padding:0px;' + 
        'height:' + parseInt(font_size * 0.5) + 'px;font-size:' + bigfont + 'px;color:red">' + message + 
        '</div><br />';
      } else {
        formatted_message = "";
      }
      message = "";
      if (stay_logged_in == "on") {
        staylogged = 'staySignedIn();';
      } else {
        staylogged  = "";
      }
    
// Prepare Tweats Display
      tweat_list = "";
      if (chat == "true") {
// Display Tweats as Chat in iframe
        name = name.replace(" ", "+");
        tweat_list += "<iframe id='tweats_iframe' src='/get_tweats/" + name + 
    "' style='width:1250px;height:590px;position:absolute;" + 
          "left:10px'><p>Your browser doesn't support iframes!</p></iframe>" + 
    "<p style='position:relative;left:20px;top:590px'><i>Note:&nbsp;&nbsp;The creator of this website " + 
            "doesn't assume responsibility for its usage by others.</i></p>" + 
    "<br /><img id='picture' src='/users/" + picture_url + "' style='position:relative;top:570px' />" + 
    "<p style='position:relative;top:590px'>&nbsp;</p>";
        display_tweats(req, res);
      } else {
    
// Display Tweats as non-Chat without iframe
        tweat_list += "<div id='pic_top' style='position:relative;left:7px;top:-12px'><img id='top' " + 
    "src='/users/transparent.gif' onload='startPic();' /><img id='picture' src='/users/" + picture_url + "\' />" + 
    "</div></div></div>";
    
// Get Tweats from followed users and signed-in user for non-Chat Mode
        var client = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
        client.query("USE " + DATABASE_NAME);
        client.query("SET NAMES 'utf8'");
        client.query("SELECT t.id, t.user_name, t.tweat, t.hashtag, u.name FROM tweats AS t INNER JOIN " + 
          "users AS u ON t.user_name = u.user_name WHERE t.user_name IN " + 
          "(SELECT followed_one FROM followed_ones AS f WHERE f.user_name = ?) ORDER BY t.id DESC LIMIT ?", [user_name, parseInt(shown_limit)], function (err, results, fields) {
          if (err) {
            throw err;
          }
          if (results.length) {
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
                    if (err2) {
                      throw err2;
                    }
                  });
                  client2.end();
                  continue;
                }
              }    
              tweat_list += "<div class='row' style='color:black'><div class='col-md-3 text-right' " + 
                "style='word-wrap: break-word; margin-right: 1em; position:relative; left:46px'><b>" + 
                wordwrap(myrow_name.replace(/%20/g, " "), 40, '<br />', true) + 
                "</b>:</div><div class='col-md-9' style='margin-left: -2em; position:relative; left:46px'><p>" + 
                wordwrap(myrow_tweat.replace(/%20/g, " "), tweat_width, '<br />', true);
              if ((myrow_name == name) || (user.admin_status == 1)) {
                no_quote_tweat = noQuoteTweat(myrow_tweat);

// X button to delete Tweat
                tweat_list += "&nbsp;&nbsp;<img src='/users/xdel.png' style='position:relative;top:-1px' onclick='" + 
      "if (confirm(\"Are you sure you want to delete this Tweat?:\\n  " + no_quote_tweat + 
    "...\")) {window.open(\"/delete_tweat/" + tid + "\");}' />";
              }
              tweat_list += "</p></div></div>";
            }
          }
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
          display_tweats(req, res);
        });
      }
    });    
  });
  return;
}

function display_tweats(req, res) {
/**
 * Display user's Home page and its Tweats.
 */
  tweat_list = tweat_list.replace(/%3D/g, "=");
  tweat_list = tweat_list.replace(/%26/g, "&");
  if (stay_logged_in == "on") {
    staySignedIn = "staySignedIn();\n\n";
  } else {
    staySignedIn = "";
  }
  if (tweat_notify == 1) {
    var notify = "checked";
  } else {
    var notify = "unchecked";
  }
  var decoded_tweat_list = tweat_list.replace(/\\"/g, '"').replace(/\\'/g, "'");

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
'var picHtmlBottom = "<img id=\'picture\' src=\'/users/' + picture_url + '\' style=\'position:relative;' +
'top:-20px;padding-bottom:20px\' />"; // Image tag for below Tweats\n' + 
'var color = "' + text_color + '";\n' + 
'var pic_scale = ' + pic_scale + ';\n' + 
'var pic_position = "' + pic_position + '";\n' + 
'var pic_visible = "' + pic_visible + '";\n' + staySignedIn + 
'var datebr = new Date();\n' + 
'datebr.setTime(datebr.getTime() + (86400000 * 365 * 67));\n' + 
'if (navigator.appVersion.indexOf("Chrome") >= 0) {\n' +
'  document.cookie = "browser_name=Chrome; expires=" + datebr.toGMTString() + "; path=/";\n' + 
'} else if (navigator.appVersion.indexOf("5.0 (Windows)") >= 0) {\n' +
'  document.cookie = "browser_name=Firefox; expires=" + datebr.toGMTString() + "; path=/";\n' + 
'} else if (navigator.appVersion.indexOf("(Windows ") >= 0) {\n' +
'  document.cookie = "browser_name=MSIE; expires=" + datebr.toGMTString() + "; path=/";\n' + 
'} else {\n' +
'  document.cookie = "browser_name=Chrome; expires=" + datebr.toGMTString() + "; path=/";\n' + 
'  }\n' +
'preload("/users/xdel.png","/users/backviolet.png","/users/transparent.gif","/users/' + picture_url + 
'","/users/favicon.png");\n'+
'function preload() {\n'+
'  for (var ii = 0; ii < arguments.length; ii++) {\n'+
'    $("<img />").attr("src", arguments[ii]);\n'+
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
'    date.setTime(date.getTime() + (86400000 * 365 * 67));\n' + 
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
'         date.setTime(date.getTime() -  7200000);\n' + 
'         document.cookie = "user_name=; expires=" + date.toGMTString() + "; path=/";\n' + 
'         document.cookie = "password=; expires=" + date.toGMTString() + "; path=/";\n' + 
'         document.cookie = "stay_logged_in=off; expires=" + date.toGMTString() + "; path=/";\n' + 
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
'     date.setTime(date.getTime() + (86400000 * 365 * 67));\n' + 
'     document.cookie = "user_name=' + user_name + '; expires=" + date.toGMTString() + "; path=/";\n' + 
'     document.cookie = "password=' + password + '; expires=" + date.toGMTString() + "; path=/";\n' + 
'     document.cookie = "stay_logged_in=on; expires=" + date.toGMTString() + "; path=/";\n' + 
'     window.reload();\n' + 
'   }\n' + 
'   function staySignedInWithAlert() {\n' + 
'     window.open("/stay_logged_on");\n' + 
'     staySignedIn();\n' + 
'   }\n' + 
'  function about() {\n' + 
'    alert("Tweater is an app created by David K. Crandall, \\nto show his programming skills using Node.js, Ex' + 
'press, MySQL, Bootstrap, Angular.js, jQuery, JavaScript, HTML5 and CSS3. The sourcecode \\nis in this GitHub ' + 
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
'     date.setTime(date.getTime() + (86400000 * 365 * 67));\n' + 
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
'     date.setTime(date.getTime() + (86400000 * 365 * 67));\n' + 
'     document.cookie = "font_size=" + fontsize + "; expires=" + date.toGMTString() + "; path=/";\n' + 
'     location.replace("' + SELF_NAME + '");\n' + 
'   }\n' + 
'   function fontEntry() { // Choose font\n' + 
'     var newfont = prompt("Current font: ' + font + '. Enter desired font: ", "Helvetica");\n' + 
'     if ((newfont != "") && (newfont != "' + font + '")) {\n' + 
'       var date = new Date();\n' + 
'       date.setTime(date.getTime() + (86400000 * 365 * 67));\n' + 
'       document.cookie = "font_family=" + newfont + "; expires=" + date.toGMTString() + "; path=/";\n' + 
'       location.replace("' + SELF_NAME + '");\n' + 
'     }\n' + 
'   }\n' + 
' // Text color for contrast\n' + 
'   function toggleBW() { // Toggle font color black/white\n' + 
'     var date = new Date();\n' + 
'     date.setTime(date.getTime() + (86400000 * 365 * 67));\n' + 
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
'       date.setTime(date.getTime() + (86400000 * 365 * 67));\n' + 
'       document.cookie = "shown_limit=" + newlimit + "; expires=" + date.toGMTString() + "; path=/";\n' + 
'       location.replace("' + SELF_NAME + '");\n' + 
'     }\n' + 
'   }\n' + 
'// Package Installer Exercise, written in JavaScript by David K. Crandall, phone: 619-488-5971, ' + 
'email: davareno58@gmail.com\n'+
'\n'+
'   function tweatWidth() { // Change maximum width of Tweats display\n' + 
'     var newwidth = prompt("Current width of Tweats display: ' + tweat_width + 
' characters. Enter desired width: ", "80");\n' + 
'     if ((newwidth != "") && (newwidth != "' + tweat_width + '")) {\n' + 
'       if ((newwidth == "") || (newwidth + 1 == 1) || (newwidth.indexOf("-") >= 0)) {\n' + 
'         newwidth = 80;\n' + 
'       }\n' + 
'       var date = new Date();\n' + 
'       date.setTime(date.getTime() + (86400000 * 365 * 67));\n' + 
'       document.cookie = "tweat_width=" + newwidth + "; expires=" + date.toGMTString() + "; path=/";\n' + 
'       location.replace("' + SELF_NAME + '");\n' + 
'     }\n' + 
'   }\n' + 
'   function picUrl() { // Add html tags to given image URL\n' + 
'     $("#tweat").val($("#tweat").val().replace(/(http\\S+)/gi, \'<img src="$1" />\'));\n' + 
'   }\n' + 
'   function viewUser(user) { // Show another user\'s Public Page (profile)\n' + 
'     window.open("view_user_name/" + user);\n' + 
'   }\n' + 
'   function settings() { // Change password or email address\n' + 
'     var chosen = prompt("Would you like to change your password or your email address? " + ' + 
'"(password or email)", "");\n' + 
'     if (chosen.toLowerCase() == "password") {\n' + 
'       window.open("/change_password");\n' + 
'     } else if (chosen.toLowerCase().substring(0,5) == "email") {\n' + 
'       window.open("/new_email_address");\n' + 
'     }\n' + 
'   }\n' + 
'   function notifications() { // Set email Tweat Notifications preference\n' + 
'     var notify = prompt("Would you like email Tweat Notifications of Tweats posted by people " + ' + 
'       "you\'re following? (Yes or No) (If so, add apache@crandall.altervista.org to your email contact list.)' +
'", "");\n' + 
'     if (notify.trim().toLowerCase().substr(0,1) == "y") {\n' + 
'       window.open("/change_notify/true");\n' + 
'     } else {\n' + 
'       window.open("/change_notify/false");  \n' + 
'     }\n' + 
'   }\n' + 
'   function hashtagSearch() { // Search Tweats by hashtag (subject), e.g. #popmusic\n' + 
'     var hashtag = $("#hashtag_search").val();\n' + 
'     if ((!hashtag) || (hashtag == "#")) {\n' + 
'       alert("Please type a hashtag in the Hashtag Search field before pressing the button.");\n' + 
'       return;\n' + 
'     }\n' + 
'     hashtag = hashtag.trim().toLowerCase();\n' + 
'     if (hashtag.substr(0,1) == "#") {\n' + 
'       hashtag = hashtag.substr(1);\n' + 
'     }\n' + 
'     hashtag = hashtag.replace(/(\\*)/g, "%2A");\n' + 
'     hashtag = hashtag.replace(/\\?/g, "%3F");\n' + 
'     hashtag = hashtag.replace(/ /g, "");\n' + 
'     window.open("/hashtag_search_results/" + hashtag);\n' + 
'   }\n' + 
'   function chatToggle(mode) { // Toggle Chat Mode for 10-second Tweats refresh\n' + 
'     var date = new Date();\n' + 
'     // 5 minute timeout (300000ms) if user doesn\'t send a Tweat\n' + 
'     var chatTimeout = date.getTime() + 300000;\n' + 
'     date.setTime(date.getTime() + (86400000 * 365 * 67));\n' + 
'     if (mode == "true") {\n' + 
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
'     window.open("' + SELF_NAME + '");\n' + 
'     window.close("","_parent");\n' +
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
'        </select></form>' + 
'        <div style="text-align:center">' +
'        <div class="checkbox">' +
'        <label><input type="checkbox" value="" ' + notify + ' onclick="notifications();"><span ' +
'        style="background-color:orange">Notify by email</span>&nbsp;&nbsp;' + followers_count +
' Followers</label></div></div></div>' + 
'        <form action="/info_update" method="POST" role="form" id="intinfo" name="intinfo">' + 
'        <span>' + 
'        <div>' + 
'        <fieldset class="fieldset-auto-width" style="float:left"><b>Interests and Information:&nbsp;&nbsp;' + 
'&nbsp;</b>' + 
'        <button type="submit" id="intsubmit" class="btn btn-info" ' + 
'style="margin-left:-9px;position:relative;' + interests_position + '" >' + 
'Update</button><input type="hidden" name="message" value="Updated Interests and Information! (Limit: ' + 
TWEATMAXSIZE + ' bytes.)"></input>' + 
'        <div class="span3 form-group">' + 
'        <textarea class="textarea inbox" rows="4" cols="36" id="interests" name="interests" ' + 
'maxlength="' + TWEATMAXSIZE + '" ' + 
'          placeholder="You may type your interests and/or information here and press Update &#8593."' + 
'          style="font-size:' + font_size + ';height:80px;' + interests_width + '">' + interests + '</textarea>' + 
'        </div>' + 
'        </fieldset>' + 
'        </div>' + 
'        </span>' + 
'        </form>' + 
'        </div>' + tweat_form_html + 
'        </div></div></div><div class="row">' + decoded_tweat_list + 
'&nbsp;<br />&nbsp;<br />&nbsp;</div>' +
'<div id="preloaded-images"> <img src="/users/backviolet.png" width="1" height="1" /> <img src="/users/xdel.png" width="1" height="1" /> <img src="/users/favicon.png" width="1" height="1" /> <img src="/users/transparent.gif" width="1" height="1" /> <img src="/users/' + picture_url + '" width="1" height="1" /> </div>' +
'</body></html>');
  res.end();
  return;
}

function main_init(req, res) {
/**
 * Initialize user header HTML and user variables from cookies.
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

  if (cookies.get('pic_position')) { // Uploaded image position
    pic_position = cookies.get('pic_position');
  } else {
    pic_position = "Top"; // Default is above Tweats
  }
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
  getFont();  
  if (cookies.get('tweat_width')) { // Display width of Tweats is adjustable
    tweat_width = cookies.get('tweat_width');
  } else {
    tweat_width = Math.floor(1600 / font_size);
  }
   
  if (cookies.get('shown_limit')) { // Maximum number of Tweats and Search Results is adjustable
    shown_limit = cookies.get('shown_limit');
    if (isNaN(shown_limit)) {
      shown_limit = SHOWN_LIMIT_INITIAL;
    }
  } else {
    shown_limit = SHOWN_LIMIT_INITIAL;
  }
  
  browser_name = 'Chrome';
  if (cookies.get('browser_name')) { // Get browser name from cookie
    browser_name = cookies.get('browser_name');
  }

// header is menu bar buttons at top of page
  if (browser_name == "Chrome") {
    title_position = "right: -77px;";
    sign_in_width = "width:506px;";
    margin_left = "margin-left: -43px;";
    interests_position = "left:3px;";
    interests_width = "width:310px;position:relative;top:2px";
    header = '<nav class="navbar navbar-default" style="width:1207px">' + 
'    <ul class="nav nav-pills" style="background-color:#C0C0F0">' + 
'      <li role="presentation" class="btn btn-success"><a href="' + SELF_NAME + '" style="color:lightgray">' + 
'Home</a></li>' + 
'      <li role="presentation"><button type="button" class="btn btn-info" style="height:54px;width:91px"' + 
'        onclick="about();">About</button></li>' + 
'      <li role="presentation" class="btn btn-success"><a href="/upload_picture" ' + 
'        style="color:lightgray" target="_blank">Upload Picture</a></li>' + 
'      <li role="presentation"><button type="button" class="btn btn-primary" style="height:54px;width:178px"' + 
'        onclick="staySignedInWithAlert();">Remain Signed In</button></li>' + 
'      <li role="presentation"><button type="button" class="btn btn-success" style="color:lightgray;' + 
'width:104px;height:54px" onclick="contact();">Contact</button></li>' + 
'      <li role="presentation"><button type="button" class="btn btn-warning" style="height:54px;width:126px"' + 
'        onclick="unsubscribe();">Unsubscribe</button></li>' + 
'      <li role="presentation" class="btn btn-info" style="width:96px"><a href="/help" target="_blank">' + 
'Help</a></li>' + 
'      <li role="presentation" class="btn btn-primary"><a onclick="settings();" style="color:lightgray">' + 
'Settings</a></li>' + 
'      <li role="presentation" class="btn btn-danger"><a href="/user/signout" onclick="signOut();"' + 
'        style="color:lightgray">Sign Out</a></li>' + 
'     <li role="presentation" class="btn btn-info">' + 
'        <a href="/view_user_name/' + user_name + '" target="_blank">Public Page</a>' + 
'      </li>' + 
'    </ul>' + 
'</nav>';
    tweat_form_html = '<div class="col-md-9" style="background-color:#9999FF;margin-left:0px;margin-right:6px;' + 
'border: 4px outset darkblue;padding:10px;height:259px;width:869px">' + 
'        <form action="/post_tweat" method="POST" role="form" id="tweatform">' + 
'        <span>' + 
'        <div ng-app="">' + 
'        <fieldset class="fieldset-auto-width" style="float:left">' + 
'        <div class="span9 form-group" style="height:170px">' + 
'        <textarea class="textarea inbox" style="width:840px" rows="3" cols="103" id="tweat" ' + 
'name="tweat" autofocus ng-model="tweat" maxlength="' + TWEATMAXSIZE + '" placeholder=' + 
'          "Type your Tweat here (limit: ' + TWEATMAXSIZE + ' characters) and then click the Post Tweat ' + 
'button or press Enter.">' + 
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
'        <button type="submit" class="btn btn-' + chat_button + '" onclick="chatToggle(\'' + chat_toggle + 
'\')" style="position:relative;left:3px;top:-8px">' + chat_button_action + ' Chat</button>' + 
'        <input type="hidden" class="form-control" name="name" value="' + esc_name + '"><br /></form>' + 
'        <form><span style="position:relative;top:-3px">Hashtag Search: #</span><input type="text" ' + 
'id="hashtag_search" style="font-size:' + font_size + ';width:450px;position:relative;top:-4px" ' + 
'name="hashtag_search" maxlength="30" placeholder="To search Tweats, type the hashtag here and press--&gt;"' + 
'</input><button type="submit" class="btn btn-primary" onclick="hashtagSearch();" style="margin:2px;' + 
'position:relative;top:-3px;left:2px">Hashtag Search</button>&nbsp;' + 
'        <button type="button" class="btn btn-warning" onclick="shownLimit();" style="position:relative;' + 
'top:-3px;padding-left:3px;padding-right:3px">Limit ' + shown_limit + '</button>' + 
'        </span></span><br /></div></fieldset></div></form>' + 
'<form action="/user_search_results" method="POST" role="form" target="_blank" id="user_search_form"><br />' +
'<nobr><span style="position:relative;top:-27px">User Search: </span><input type="text" id="search_any" name="search_any" size="61" maxlength="250" ' +
'  style="position:relative;top:-28px;height:26px" placeholder="To search by interests, info or names, type them here and press--&gt;" ' +
'  style="font-size:' + font_size + '"></input>&nbsp;<button type="submit" class="btn btn-info" style="position:relative;top:-27px;left:-1px">User Search</button></nobr><br />' +
'</form>' +
'<form action="/boolean_search_results" method="POST" role="form" target="_blank"><br />' + 
'        <nobr><span style="position:relative;top:-49px;left:-40">Boolean Search: <input type="text" ' + 
'style="position:relative;width:250px" placeholder="First Search Term" id="search_one" ' + 
'          name="search_one" maxlength="30" size="26">' + 
'        <select class="inbox" id="search_type" name="search_type" style="position:relative;left:-5px">' + 
'                  <option value="AND" default>AND</option>' + 
'                  <option value="OR">OR</option>' + 
'                  <option value="NOT">NOT</option>' + 
'        </select><input type="text" style="position:relative;left:-5px;width:250px" ' + 
'placeholder="Second Search Term" id="search_two" name="search_two" value="" maxlength="30" size="26">' + 
'        <button type="submit" class="btn btn-warning" style="position:relative;left:-6px">Boolean ' + 
'Search</button></span></nobr></form>';
  } else if (browser_name == "MSIE") {
    title_position = "right: -153px;";
    sign_in_width = "";
    margin_left = "margin-left: -53px;";
    interests_position = "left:2px;";
    interests_width = "";
    header = '<nav class="navbar navbar-default" style="width:1215px">' + 
'    <ul class="nav nav-pills" style="background-color:#C0C0F0">' + 
'      <li role="presentation" class="btn btn-success"><a href="' + SELF_NAME + '" style="color:lightgray">' + 
'Home</a></li>' + 
'      <li role="presentation"><button type="button" class="btn btn-info" style="height:54px;width:96px"' + 
'        onclick="about();">About</button></li>' + 
'      <li role="presentation" class="btn btn-success"><a href="/upload_picture" ' + 
'        style="color:lightgray" target="_blank">Upload Picture</a></li>' + 
'      <li role="presentation" class="btn btn-primary"><a href="' + SELF_NAME + '" ' + 
'        onclick="staySignedInWithAlert();" style="color:lightgray">Remain Signed In</a></li>' + 
'      <li role="presentation"><button type="button" class="btn btn-success" style="color:lightgray;' + 
'width:104px;height:54px" onclick="contact();">Contact</button></li>' + 
'      <li role="presentation" class="btn btn-warning"><a href="' + SELF_NAME + '" onclick="unsubscribe();">' + 
'Unsubscribe</a></li>' + 
'      <li role="presentation" class="btn btn-info" style="width:100px"><a href="/help" target="_blank">' + 
'Help</a></li>' + 
'      <li role="presentation" class="btn btn-primary"><a onclick="settings();" style="color:lightgray">' + 
'Settings</a></li>' + 
'      <li role="presentation" class="btn btn-danger"><a href="/user/signout" onclick="signOut();"' + 
'        style="color:lightgray">Sign Out</a></li>' + 
'     <li role="presentation" class="btn btn-info">' + 
'        <a href="view_user_name/' + user_name + '" style="width:105px" target="_blank">Public Page</a>' + 
'      </li>' + 
'    </ul>' + 
'</nav>';
    tweat_form_html = '<div class="col-md-9" style="background-color:#9999FF;margin-left: 0px;margin-right: 6px;border: 4px outset darkblue;padding:10px;height:259px">' +
'<form action="/post_tweat" method="POST" role="form" id="tweatform">' +
'<span>' +
'<div ng-app="">' +
'<fieldset class="fieldset-auto-width" style="float:left">' +
'<div class="span9 form-group" style="height:170px">' +
'<textarea class="textarea inbox" rows="4" cols="103" id="tweat" name="tweat" autofocus ng-model="tweat" ' +
'  onkeyup="showCharsLeftAndLimit(this);" maxlength="' + TWEATMAXSIZE + '" placeholder=' +
'  "Type your Tweat here (limit: ' + TWEATMAXSIZE + ' characters) and then click the Post Tweat button or press Enter.">' +
'  </textarea><br />' +
'<button type="submit" class="btn btn-success">Post Tweat</button>' +
'<span style="font-family:Courier New, monospace">' +
'<span ng-bind="(\'0000\' + (' + TWEATMAXSIZE + ' - tweat.length)).slice(-3)"></span> characters left' +
'</span>' +
'<span><button type="button" class="btn btn-warning" onclick="textErase();">Erase</button>' +
'<button type="button" class="btn btn-success" style="width:100px" onclick="textLarger();">Text Size+</button>' +
'<button type="button" class="btn btn-primary" style="padding-left:2px;padding-right:2px;width:80px" onclick="textSmaller();">Text Size-</button>' +
'<button type="button" class="btn btn-info" onclick="fontEntry();">Font</button>' +
'<button type="button" class="btn btn-primary" style="padding-left:2px;padding-right:2px;width:47px" onclick="toggleBW();">B/W</button>' +
'<button type="button" class="btn btn-info" style="position:relative;left:-1px" onclick="tweatWidth();">Width</button>&nbsp;' +
'<button type="submit" class="btn btn-' + chat_button + '" onclick="chatToggle(' + chat_toggle + ')" ' +
' style="position:relative;left:-6px">' + chat_button_action + ' Chat</button>' +
'<input type="hidden" class="form-control" name="name" value="' + esc_name + '"><br /></form>' +
'<form><span style="position:relative;top:3px">Hashtag Search: #</span><input type="text" id="hashtag_search" style="font-size:' + font_size + ';width:450px;position:relative;top:5px"' +
'  name="hashtag_search" maxlength="30" placeholder="To search Tweats, type the hashtag here and press--&gt;"></input>' +
'  <button type="submit" class="btn btn-primary" onclick="hashtagSearch();" style="margin:2px">Hashtag Search</button>&nbsp;' +
'<button type="button" class="btn btn-warning" onclick="shownLimit();" style="padding-left:3px;padding-right:3px">Limit ' + shown_limit + '</button>' +
'</span></span><br /></div></fieldset></div></form>' +
'<form action="/user_search_results" method="POST" role="form" target="_blank" id="user_search_form"><br />' +
'<nobr><span style="position:relative;top:-22px">User Search: </span><input type="text" id="search_any" name="search_any" size="72" maxlength="250" ' +
'  style="position:relative;top:-19px;height:26px" placeholder="To search by interests, info or names, type them here and press--&gt;" ' +
'  style="font-size:' + font_size + '"></input>&nbsp;<button type="submit" class="btn btn-info" style="position:relative;top:-24px">User Search</button></nobr><br />' +
'</form>' +
'<form action="/boolean_search_results" method="POST" role="form" target="_blank"><br />' +
'<nobr><span style="position:relative;top:-46px">Boolean Search: <input type="text" ' +
'  style="position:relative;top:3px" placeholder="First Search Term" id="search_one" ' +
'  name="search_one" maxlength="30" size="26">' +
'<select class="inbox" id="search_type" name="search_type" style="position:relative;left:-5px;top:1px">' +
'          <option value="AND" default>AND</option>' +
'          <option value="OR">OR</option>' +
'          <option value="NOT">NOT</option>' +
'</select><input type="text" style="position:relative;top:3px;left:-6px" placeholder="Second Search Term" id="search_two" name="search_two" value="" maxlength="30" size="26">' +
'<button type="submit" class="btn btn-warning" style="position:relative;top:-2px;left:-6px">Boolean Search</button></span></nobr></form>';
  } else if (browser_name == "Firefox") {
    title_position = "right: -77px;";
    sign_in_width = "width:506px;";
    margin_left = "margin-left: -43px;";
    interests_position = "left:3px;";
    interests_width = "width:310px;position:relative;top:2px";
    header = '<nav class="navbar navbar-default" style="width:1215px">' + 
'    <ul class="nav nav-pills" style="background-color:#C0C0F0">' + 
'      <li role="presentation" class="btn btn-success"><a href="' + SELF_NAME + '" style="color:lightgray">' + 
'Home</a></li>' + 
'      <li role="presentation"><button type="button" class="btn btn-info" style="height:54px;width:100px"' + 
'        onclick="about();">About</button></li>' + 
'      <li role="presentation" class="btn btn-success"><a href="/upload_picture" ' + 
'        style="color:lightgray" target="_blank">Upload Picture</a></li>' + 
'      <li role="presentation" class="btn btn-primary"><a href="' + SELF_NAME + '" ' + 
'        onclick="staySignedInWithAlert();" style="color:lightgray">Remain Signed In</a></li>' + 
'      <li role="presentation"><button type="button" class="btn btn-success" style="color:lightgray;' + 
'width:104px;height:54px" onclick="contact();">Contact</button></li>' + 
'      <li role="presentation" class="btn btn-warning"><a href="' + SELF_NAME + '" onclick="unsubscribe();">' + 
'Unsubscribe</a></li>' + 
'      <li role="presentation" class="btn btn-info" style="width:100px"><a href="/help" target="_blank">' + 
'Help</a></li>' + 
'      <li role="presentation" class="btn btn-primary"><a onclick="settings();" style="color:lightgray">' + 
'Settings</a></li>' + 
'      <li role="presentation" class="btn btn-danger"><a href="/user/signout" onclick="signOut();"' + 
'        style="color:lightgray">Sign Out</a></li>' + 
'     <li role="presentation" class="btn btn-info">' + 
'        <a href="view_user_name/' + user_name + '" style="width:105px" target="_blank">Public Page</a>' + 
'      </li>' + 
'    </ul>' + 
'</nav>';
    tweat_form_html = '<div class="col-md-9" style="background-color:#9999FF;margin-left:0px;margin-right: 6px;border: 4px outset darkblue;padding:10px;height:259px;width:869px">' +
'<form action="/post_tweat" method="POST" role="form" id="tweatform">' +
'<span>' +
'<div ng-app="">' +
'<fieldset class="fieldset-auto-width" style="float:left">' +
'<div class="span9 form-group" style="height:170px">' +
'<textarea class="textarea inbox" style="width:840px;height:89px" rows="3" cols="104" id="tweat" name="tweat" autofocus ng-model="tweat" ' +
'  onkeyup="showCharsLeftAndLimit(this);" maxlength="' + TWEATMAXSIZE + '" placeholder=' +
'  "Type your Tweat here (limit: ' + TWEATMAXSIZE + ' characters) and then click the Post Tweat button or press Enter.">' +
'  </textarea><br />' +
'<button type="submit" class="btn btn-success" style="position:relative;top:-2px">Post Tweat</button>' +
'<span style="font-family:Courier New, monospace;position:relative;top:-3px">' +
'<span ng-bind="(\'0000\' + (' + TWEATMAXSIZE + ' - tweat.length)).slice(-3)"></span> characters left' +
'</span>' +
'<span style="position:relative;top:6px"><button type="button" class="btn btn-warning" onclick="textErase();" style="position:relative;top:-8px">Erase</button>' +
'<button type="button" class="btn btn-success" onclick="textLarger();" style="position:relative;top:-8px;width:100px">Text Size+</button>' +
'<button type="button" class="btn btn-primary" onclick="textSmaller();" style="position:relative;top:-8px;padding-left:2px;padding-right:2px;width:80px">Text Size-</button>' +
'<button type="button" class="btn btn-info" onclick="fontEntry();" style="position:relative;top:-8px">Font</button>' +
'<button type="button" class="btn btn-primary" onclick="toggleBW();" style="position:relative;top:-8px;padding-left:2px;padding-right:2px;width:47px">B/W</button>' +
'<button type="button" class="btn btn-info" style="position:relative;top:-8px;width:49px;padding-left:3px;padding-right:3px" onclick="tweatWidth();">Width</button>&nbsp;' +
'<button type="submit" class="btn btn-' + chat_button + '" onclick="chatToggle(' + chat_toggle + ')" ' +
' style="position:relative;left:-6px;top:-8px">' + chat_button_action + ' Chat</button>' +
'<input type="hidden" class="form-control" name="name" value="' + esc_name + '"><br /></form>' +
'<form><span style="position:relative;top:-1px">Hashtag Search: #</span><input type="text" id="hashtag_search" style="font-size:' + font_size + ';width:450px;height:26px"' +
'  name="hashtag_search" maxlength="30" placeholder="To search Tweats, type the hashtag here and press--&gt;"></input>' +
'  <button type="submit" class="btn btn-primary" onclick="hashtagSearch();" style="margin:2px;position:relative;top:-4px;left:-6px">Hashtag Search</button>&nbsp;' +
'<button type="button" class="btn btn-warning" onclick="shownLimit();" style="position:relative;top:-4px;left:-13px">Limit ' + shown_limit + '</button>' +
'</span></span><br /></div></fieldset></div></form>' +
'<form action="/user_search_results" method="POST" role="form" target="_blank" id="user_search_form"><br />' +
'<nobr><span style="position:relative;top:-19px">User Search: </span><input type="text" id="search_any" name="search_any" size="72" maxlength="250" ' +
'  style="position:relative;top:-19px;height:26px" placeholder="To search by interests, info or names, type them here and press--&gt;" ' +
'  style="font-size:' + font_size + '"></input>&nbsp;<button type="submit" class="btn btn-info" style="position:relative;top:-21px">User Search</button></nobr><br />' +
'</form>' +
'<form action="/boolean_search_results" method="POST" role="form" target="_blank"><br />' +
'<nobr><span style="position:relative;top:-45px;left:-33">Boolean Search: <input type="text" ' +
'  style="position:relative;top:0px;width:250px;height:26px" placeholder="First Search Term" id="search_one" ' +
'  name="search_one" maxlength="30" size="26">' +
'<select class="inbox" id="search_type" name="search_type" style="position:relative;left:-5px">' +
'          <option value="AND" default>AND</option>' +
'          <option value="OR">OR</option>' +
'          <option value="NOT">NOT</option>' +
'</select><input type="text" style="position:relative;top:0px;left:-6px;width:250px;height:26px" placeholder="Second Search Term" id="search_two" name="search_two" value="" maxlength="30" size="26">' +
'<button type="submit" class="btn btn-warning" style="position:relative;top:-1px;left:-6px">Boolean Search</button></span></nobr></form>';
  }
}

function delete_tweat(req, res) {
/**
 * Process the requested deletion of a Tweat.
 */
  cookies = new Cookies(req, res);
  user_name = cookies.get('user_name').replace("%40","@");
  password = cookies.get('password').replace("%40","@");
  password_hash = passwordHash(password);

  var client2 = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
  client2.query("USE " + DATABASE_NAME);
  client2.query("SET NAMES 'utf8'");

// Check administrator status with username and password hash of case-sensitive password
  client2.query("SELECT * from " + DATABASE_TABLE + " WHERE ((user_name = ?) OR (email = ?)) AND (BINARY password_hash = ?) LIMIT 1", [user_name, user_name, password_hash], function (err2, results2, fields2) {
    if (err2) {
      message = "ERROR: Tweat not deleted! Sorry, but something went wrong.<br />" + 
        "You may try to delete the Tweat again. ";
      throw err2;
    } else {
      var status = results2[0]['admin_status'];
      client2.end();

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
          client3.end();
          writeHeadHTML(res);
          res.end("<!DOCTYPE html><html><head><title>Tweat Delete</title><body onload=\"alert('" + message + 
            "');window.close();\"><h1><b style='font-size:" + 
            "72px;color:red;background-color:violet'>&nbsp;Tweater&nbsp;</b></h1><h1 style='text-align:center'>" +
            "<a href='/' onclick=\"location.replace('/');\">If you're not redirected to Tweater in a few " +
            "seconds, please click here.</a></h1></body></html>");
          message = "";
        });
      } else {
// Non-administrator deletes his own Tweat
        client3.query("DELETE FROM tweats WHERE user_name = ? AND id = ? LIMIT 1", [user_name, tid], function (err3, results3, fields3) {
          if (err3) {
            message = "ERROR: Tweat not deleted! Sorry, but something went wrong.<br />" + 
          "You may try to delete the Tweat again. ";
            throw err3;
          } else {
            message = "The Tweat was deleted. To erase it from your screen, click the Home button at the top " +
              "left to reload the page.";
          }
          client3.end();
          writeHeadHTML(res);
          res.end("<!DOCTYPE html><html><head><title>Tweat Delete</title><body onload=\"alert('" + message + 
            "');window.close();\"><h1><b style='font-size:" + 
            "72px;color:red;background-color:violet'>&nbsp;Tweater&nbsp;</b></h1><h1 style='text-align:center'>" +
            "<a href='/' onclick=\"location.replace('/');\">If you're not redirected to Tweater in a few " +
            "seconds, please click here.</a></h1></body></html>");
          message = "";
        });
      }
    }
  });
}

function password_forgotten(req, res) {
/**
 * Process the requested email reset of forgotten password.
 * @param {string} res Response from server to client.
 */
  var client = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
  client.query("USE " + DATABASE_NAME);
  client.query("SET NAMES 'utf8'");
  client.query("SELECT * FROM " + DATABASE_TABLE + " WHERE (user_name = ?) OR (email = ?) LIMIT 1", [user_name, user_name], function (err, results, fields) {
    if (err) {
      throw err;
    }
    var rows = results;
    email = rows[0]['email'];
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
      for (ii = 1; ii <= 12; ii++) {
        password_reset_code += String.fromCharCode(Math.floor((Math.random() * 26) + 97));
      }
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

      password_reset_hash = passwordHash(password_reset_code);
      var client2 = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
      client2.query("USE " + DATABASE_NAME);
      client2.query("SET NAMES 'utf8'");
      client2.query("UPDATE " + DATABASE_TABLE + " SET password_reset_hash = ? WHERE (user_name = ?) OR" + 
        " (email = ?) LIMIT 1", [password_reset_hash, user_name, user_name], function (err2, results2, fields2) {
        if (err2) {
          throw err2;
        }

// Display password reset page with Turing test
        res.write('<!DOCTYPE html><html><head><title>Password Reset</title>' + 
          '<link rel="shortcut icon" href="/users/favicon.png" type="image/png">' + SCRIPTS_EXTERNAL + turing + 
          '</head><body style="background-color:#99D9EA;padding:8px;' + 'font-family:' + font + ';font-size:' + 
          font_size + 'px" onload="turingsetup();">' + header);

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
      });
      client2.end();
    }
  });
  client.end();
}

function post_tweat(req, res) {
/**
 * Post the new Tweat to the database.
 */
  var client = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
  client.query("USE " + DATABASE_NAME);
  client.query("SET NAMES 'utf8'");

  hashtag_pos = tweat.indexOf("#"); // Look for hashtag (Tweat subject marker)
  if (hashtag_pos == -1) {
    hashtag = null;
  } else {
    hashtag_pos++;
    start = hashtag_pos;
    while ((hashtag_pos < tweat.length) && (" ,.?!:*;/()-+{}[]|\"<>\\\`".indexOf(tweat.substr(hashtag_pos, 1)) == -1)) {
      hashtag_pos++; // Find end of hashtag
    }
    hashtag = tweat.substr(start, hashtag_pos - start).toLowerCase().trim();
  }
  if (chat == "true") {
    var date = new Date();
    hashtag = "DEL" + (date.getTime() + 86400000); // In Chat Mode, store delete time instead of hashtag
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

  client.query("INSERT INTO tweats (id, user_name, tweat, hashtag) values(NULL,?,?,?)", [user_name, tweat, hashtag], function (err, results, fields) {
    if (err) {
      message = "ERROR: Tweat not posted! Sorry, but something went wrong.<br />" + 
        "You may try to post the Tweat again. ";
    } else {
      var client2 = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
      client2.query("USE " + DATABASE_NAME);
      client2.query("SET NAMES 'utf8'");
      client2.query("SELECT user_name, name, tweat_notify, email FROM users WHERE user_name IN (SELECT user_name FROM followed_ones WHERE followed_one = ? AND user_name != followed_one)", user_name, function (err2, results2, fields2) {
// Send Email Tweat Notification(s)
        var rows = results2;
        for (var rw in rows) {
          follower_email = rows[rw]['email'];
          if ((chat != "true") && (rows[rw]['tweat_notify'] == 1) && (follower_email.indexOf("@") > 0)) {
            transporter.sendMail({from: "Tweater <davareno58@gmail.com>", to: follower_email, subject: 
          'Tweat Notification: ' + name + ' (' + user_name + ') just posted this Tweat',
          html: '<head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />' + 
          '</head><body style="background-color:#99D9EA;padding:8px;font-family:' + font + 
          ';font-size:' + font_size + 'px">Hello ' + rows[rw]['name'] + 
          ',<br /><br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + name + ' (' + user_name + ') ' +
          'just posted this Tweat:<br /><br />' + wordwrap(unescape(tweat).replace(/\+/g, " "), 
          70, '<br />', true) + '<br /><br /><br />' + 
          '<a href="http://' + DATABASE_HOST + '/' + SELF_NAME + '">' + 
          '<b style="font-size:40px;color:red;background-color:violet;' + 
          'float:left;text-decoration:none">&nbsp;Tweater&nbsp;</b></a>&nbsp;&nbsp;&nbsp;&nbsp;' + 
           tweamail + '<br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />' + 
          '<br /><br /><br /><br /><br /><br /><hr />How to unsubscribe to Tweat Notifications:<br />' + 
          '<br />If you don\'t want to receive Tweat Notifications, ' + 
          'sign in to <a href="http://' + DATABASE_HOST + '/">your Tweater ' + 
          'Account</a> and click on the Tweat Notifications button at the left. ' + 
          'A pop-up prompt will appear. Type the word No and click on OK.'});
          }
        }
        client2.end();
      });
    }
    client.end();
    get_home_page(req, res);
  });
}

function page_not_found_404(req, res) {
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
"<link rel='shortcut icon' href='/users/favicon.png' type='image/png'>" + 
"<body style='background-color:#99D9EA;color:black;font-size:" + font_size + "px'>" + 
"<a href='" + SELF_NAME + "' style='font-size:" + bigfont + 
"px;'><div>&nbsp;404 Error: Tweater Page Not Found!&nbsp;<br />" + 
"<img src='/users/404.png' /><br /></div>" + 
"<div style='color:red;background-color:#990099'>&nbsp;Tweater Help:</div></a>" + 
"<img src='/users/tweatyquestion.png' style='float:right' />" + help_html);
  }
}

function show_home_page(req, res) {
/**
 * Display signed-in user's Home page.
 */
  title_position = "right: -77px;";
  sign_in_width = "width:506px;";
  margin_left = "margin-left: -43px;";
  interests_position = "left:3px;";
  interests_width = "width:310px;position:relative;top:2px";
  get_home_page(req, res);
}

function sign_in_or_register(req, res, message) {
/**
 * Display page for signing in or registering.
 */
  cookies = new Cookies(req, res);
  main_init(req, res); // Initialize main variables and also data from cookies
  if (message) {
    message = '<div class="container"><p style="font-size:' + bigfont + 'px;color:red">' + message + '</p></div>';
  } else {
    message = "";
  }
  if (!email) {
    email = "";
  }
  writeHeadHTML(res);
  res.end('<!DOCTYPE html><html><head><title>Tweater</title>' + 
'<link rel="shortcut icon" href="/users/favicon.png" type="image/png">' + SCRIPTS_EXTERNAL + turing +
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
'  var date = new Date();' + 
'  date.setTime(date.getTime() + (86400000 * 365 * 67));' + 
'  if (navigator.appVersion.indexOf("Chrome") >= 0) {' +
'     document.cookie = "browser_name=Chrome; expires=" + date.toGMTString() + "; path=/";' + 
'  } else if (navigator.appVersion.indexOf("5.0 (Windows)") >= 0) {' +
'     document.cookie = "browser_name=Firefox; expires=" + date.toGMTString() + "; path=/";' + 
'  } else if (navigator.appVersion.indexOf("(Windows ") >= 0) {' +
'     document.cookie = "browser_name=MSIE; expires=" + date.toGMTString() + "; path=/";' + 
'  } else {' +
'     document.cookie = "browser_name=Chrome; expires=" + date.toGMTString() + "; path=/";' + 
'  }' +
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
'  placeholder="Desired Username (letters and numerals only)" name="user_name" value="' + user_name + '" maxlength="50" size="50"></div>' + 
'<div class="input-group"><input type="password" class="form-control" autocomplete="off" ' + 
'  placeholder="Password: Minimum 6 Characters" name="new_user_password" maxlength="32" size="32"></div>' + 
'<div class="input-group"><input type="password" class="form-control" autocomplete="off" ' + 
'  placeholder="Confirm Password" name="password_confirm" maxlength="32" size="32"></div>' + 
'<div class="input-group"><input type="text" class="form-control" autocomplete="off" ' + 
'  placeholder="Name (letters and numerals only)" name="name" value="' + name + '" maxlength="60" size="60"></div>' + 
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
/**
 * Upload, rename and move picture and delete old picture if any.
 */
  cookies = new Cookies(req, res);
  if (cookies.get('user_name') && cookies.get('password')) {
    var given_user_name = cookies.get('user_name').replace("%40","@");
    password = cookies.get('password').replace("%40","@");
    password_hash = passwordHash(password);
    user = _.find(users, function(u) {
      return u.user_name == given_user_name;
    });
    if ((user) && (password_hash == user.password_hash)) {
      user_name = user.user_name;
      name = user.name;
      id = user.id;
      message = "";
      error_sorry = "Sorry, there was an error uploading your picture file. ";
    
      getFont();  
      var fstream;
      req.pipe(req.busboy);
      req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
        fstream = fs.createWriteStream(__dirname + '/pictures/tmp/' + filename);
        file.pipe(fstream);
        fstream.on('close', function () {
          var  picture_ext = mimetype.substr(mimetype.lastIndexOf("/") + 1).toLowerCase();
          if (picture_ext == "jpeg") {
            picture_ext = "jpg";
          }
          var uploadOk = 0;
// Allow only certain file types
          if ((mimetype != 'image/jpg') && (mimetype != 'image/jpeg') && (mimetype != 'image/png') && (mimetype != 'image/gif')) {
            message = message + "Sorry, only .jpg, .jpeg, .png and .gif files are allowed. ";
            uploadOk = 0;
          }
          if ((!cookies.get('user_name')) || (!cookies.get('password'))) {
            message = message + error_sorry;
            uploadOk = 0;
          } else {
            user_name = cookies.get('user_name').replace("%40","@");
            password = cookies.get('password').replace("%40","@");
            password_hash = passwordHash(password);
            uploadOk = 1;
          }

// Check whether uploadOk has been set to 0 by any error
          if (uploadOk == 0) {
            message = message + "Your picture file was not uploaded. ";
// If everything is ok, try to upload
          } else {
            var client = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
            client.query("USE " + DATABASE_NAME);
            client.query("SELECT * FROM " + DATABASE_TABLE + " WHERE (user_name = ?) and (binary " + 
              "password_hash = ?)", [user_name, password_hash], function (err, results, fields) {
              if (err) {
                message = "ERROR: Picture file not uploaded! Sorry, but something went wrong.<br />" +  
                  "You may try again. ";
              } else {
                if (results.length) {
                  if (results[0]['picture_ext']) {
                    var old_filename = __dirname + "/pictures/" + results[0]['id'] + "." + results[0]['picture_ext'];
                    fs.unlink(old_filename, function (err, results, fields) { // Delete old picture
                    });

                  }
                  var client2 = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
                  client2.query("USE " + DATABASE_NAME);
                  client2.query("UPDATE " + DATABASE_TABLE + " SET picture_ext = ? WHERE (user_name = ?) AND (binary" + 
                    " password_hash = ?)", [picture_ext, user_name, password_hash], function (err2, results2, fields2) {
                    if (err2) {
                      message = "ERROR: Picture not uploaded! Sorry, but something went wrong.<br />" +  
                        "You may try again. ";
                    } else {
                      client2.end();
                      user.picture_ext = picture_ext;
                      fs.rename(__dirname + "/pictures/tmp/" + filename, __dirname + "/pictures/" + id + "." + picture_ext, function(err3) {
                        if (err3) {
                          message = message + error_sorry;
                        } else {
                          message = "Picture uploaded! To see the new picture, go back to your home page an" + 
                            "d click on your browser's Refresh button or click on Home at the top left. Not" + 
                            "e: You can also post URLs of pictures that start with \\\"http\\\". After typing " + 
                            "or pasting the URL in the Tweat textbox, click the Pic button and press Enter.";
                          writeHeadHTML(res);
                          res.end("<!DOCTYPE HTML><HTML><head><script>" + 
                            "alert(\"" + message + "\"); window.close();</script></head><body></body></html>");
                          message = "";
                          return;
                        }
                        if (message) {
                          res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'});
                          res.end("<!DOCTYPE HTML><HTML><head><script>" + 
                            "alert(\"" + message + "\"); window.close();</script></head><body></body></html>");
                          message = "";
                        }
                      });
                    }
                  });
                }
              }
              client.end();
              if (message) {
                res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'});
                res.end("<!DOCTYPE HTML><HTML><head><script>" + 
                  "alert(\"" + message + "\"); window.close();</script></head><body></body></html>");
                message = "";
              }
            });
          }
        });
      }); 
    }
  } else {
    message += "Sorry, there was an error uploading your picture file. ";
  }
  return;
}

function all_users_display(req, res) {
/**
 * Display list of all users.
 */
  writeHeadHTML(res);
  res.write("<!DOCTYPE html><html><head><meta charset='utf-8' /><title>All Users Search Results</title>" +
    "<link rel='shortcut icon' href='/users/favicon.png' type='image/png'>" +
    "<script src='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js'></script>" +
    "<script src='https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js'></script>" +
    "<script><!--" +
    "(document).ready(function(){\n" +
      "('img').mousedown(function(){\n" +
        "(this).animate({opacity: '0.5'},100);\n" +
    "  });\n" +
    "});\n" +
    "//--></script>\n" +
    "<style>.user{vertical-align:middle}</style></head><body style='color:black;background-color:#C0C0F0;" + 
    "padding:8px;font-family:" + font + ";font-size:" + font_size + "px'><h2>All Users " + 
    "Search Results (Limit " + shown_limit + "):</h2><ul>");

  var client = mysql.createConnection({ host: 'localhost', user: 'root', password: PASSWORD, debug: false });
  client.query("USE " + DATABASE_NAME);
  client.query("SET NAMES 'utf8'");
  client.query("SELECT name, user_name, id as uid FROM users ORDER BY name LIMIT " + shown_limit, function (err, results, fields) {
    if (err) {
      throw err;
    } else {
      for (var myrow = 0; myrow < results.length; myrow ++) {
        vname = results[myrow]['name'];
        vuname = results[myrow]['user_name'];
        uid = results[myrow]['uid'];
        res.write("<li><img src='/users/follow.png' class='user' onclick='window.open(\"/follow/" + vuname + 
          "/" + vname + "\");' />&nbsp;&nbsp;<img src='/users/unfollow.png' class='user' onclick='" +
          "window.open(\"/unfollow/" + vuname + "/" + vname + "\");' />&nbsp;&nbsp;" +
          "<a style='a:link{color:#000000};a:vlink{color:#990099};a:alink{color:#999900};" +
          "a:hlink{color:#000099};' href='/view_user_name/" + vuname + "' target='_blank'>" + vname +
          " (Username: " + vuname + ")</a>");
// X button for administrator to delete Tweat
        if (admin) {
          res.write("&nbsp;&nbsp;<img src='/users/xdel.png' class='user' onclick='if (confirm(\"Are you " +
            "sure you want to delete this user?:\\n  " + vname + " (Username: " + vuname + "; User ID: " +
            uid + ")\")) {window.open(\"/delete_listed_user/" + uid + "/" + vuname + "\")}' />");
        }
        res.write("</li>");
      }
    }
    res.end("</ul><br /><br /></body></html>");  
    client.end();
  });
}

function chat_setup() {
/**
 * Adjust Chat Mode start/stop button and its action.
 */
  chat = 'false';
  if (cookies.get('chat')) { // Chat mode refreshes Tweat display every 10 seconds for real-time conversation
    chat = cookies.get('chat');
  }
  if (chat == "true") {
    chat_button = 'danger';
    chat_button_action = 'Stop';
    chat_toggle = 'false';
  } else {
    chat_button = 'success';
    chat_button_action = 'Start';
    chat_toggle = 'true';
  }
}

function passwordHash(password) {
/**
 * Initialize user header HTML and user variables from cookies.
 * @param {string} password Password given.
 * @returns {string} password hash of password given.
 */
  return crypto.createHmac("MD5", CRYPT_SALT).update(password).digest("base64");
}

function writeHeadHTML(res) {
/**
 * Write HTML header.
 */
  res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8' });
}

function getFont() {
/**
 * Get font information from cookies or default values.
 */
  if (cookies.get('font_size')) {
    font_size = cookies.get('font_size');
  } else {
    font_size = FONTSIZE;
    bigfont = font_size * 1.5;
  }
  if (cookies.get('font_family')) {
    font = cookies.get('font_family') + ", " + FONT_INITIAL;
  } else {
    font = FONT_INITIAL;
  }
}

function noQuoteTweat(tweat) {
/**
 * Convert Tweat to version to be displayed in popup prompt.
 */
  return tweat.substr(0,80).replace(/'/g, "&apos;").replace(/"/g, "&apos;&apos;").replace(/\t/g, " ").replace(/\n/g, " ").replace(/\r/g, " ").replace(/\f/g, " ").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Begin listening to port.
 */
app.listen(port);
console.log("Tweater Node.js version 1.0 started.");
