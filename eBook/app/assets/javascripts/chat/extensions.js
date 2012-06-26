/*

Adaptação de: Jappix - An open social platform
Estes são os JS scripts para suporte ao Atheneum Chat

-------------------------------------------------

Author: Gregory Silva, Nélisson Cavalheiro
Last revision: 30/08/11

*/

// Atheneum Chat vars
var USER_INFO_SERVICE_URL = null;
var DELETE_USER_INFO_URL = null;
var ID_NOTIFY;
var NOTIFY_USER = false;
var LIMIT_CHAT_WINDOW = 4;
var ANCHOR_CLICK = false;

function SaveServer(server, userInfoUrl, JabberInLocalMachine) {
    LOCAL_MACHINE = JabberInLocalMachine;
    SetHostBosh(server);
    USER_INFO_SERVICE_URL = userInfoUrl;
    removeDB('jappix-mini-login', 'disconnect');
}

function SetHostBosh(host) {
    HOST_MAIN = host;

    if (isLocalMachine())
        HOST_BOSH = 'http://' + HOST_MAIN + ':7070/http-bind';
    else
        HOST_BOSH = 'http://' + HOST_MAIN + '/http-bind';
}

function SaveServerDisconnect(server, userInfoUrl, JabberInLocalMachine, deleteUserInfoUrl) {
    LOCAL_MACHINE = JabberInLocalMachine;
    SetHostBosh(server);
    USER_INFO_SERVICE_URL = userInfoUrl;
    DELETE_USER_INFO_URL = deleteUserInfoUrl;
    setDB('jappix-mini-login', 'disconnect', 'yes');
    if (DELETE_USER_INFO_URL)
        ClearAll();
}

function ClearAll() {
    if (DELETE_USER_INFO_URL) {
        $.ajax({ url: DELETE_USER_INFO_URL,
                data: { },
                dataType: "jsonp",
                success: function(json) {
                    if (json.d) {
                        location.reload(true);
                    }
                }
            });
    }
}

function Login() {
    if (USER_INFO_SERVICE_URL) {
        $.ajax({ url: USER_INFO_SERVICE_URL,
            data: {},
            dataType: "jsonp",
            success: function (json) {
                if (json.d) {
                    launchMini(true, true, HOST_MAIN, json.d.Name, json.d.Password);
                    if (getDB('jappix-mini-login', 'disconnect')) {
                        disconnectMini();
                        ClearAll();
                        jQuery('#jappix_mini').remove();
                    }
                }
            }
        });
    }
}

// Manages and creates a chat
function chatMini(type, xid, nick, hash, pwd, show_pane) {
    var current = '#jappix_mini #chat-' + hash;

    // Not yet added?
    if (!exists(current)) {
        // Create the HTML markup
        var html = '<div class="jm_conversation jm_type_' + type + '" id="chat-' + hash + '" data-xid="' + escape(xid) + '" data-type="' + type + '" data-nick="' + escape(nick) + '" data-hash="' + hash + '" data-origin="' + escape(cutResource(xid)) + '">' +
				'<div class="jm_chat-content">' +
					'<div class="jm_actions">' +
						        '<span class="jm_nick">' + nick + '</span>' +
                                '<a class="jm_one-action jm_close jm_images" title="' + _e("Close") + '" href="#"></a>' +
                            '</div>' +
			'<div class="jm_received-messages" id="received-' + hash + '"></div>' +
				'<form action="#" method="post">' +
					'<input type="text" class="jm_send-messages" name="body" autocomplete="off" />' +
					'<input type="hidden" name="xid" value="' + xid + '" />' +
					'<input type="hidden" name="type" value="' + type + '" />' +
				'</form>' +
			'</div>' +

			'<a class="jm_pane jm_chat-tab jm_images" href="#">' +
				'<span class="jm_name">' + nick.htmlEnc() + '</span>' +
			'</a>' +
		'</div>';

        var countChatWindow = jQuery('#jappix_mini div.jm_conversations').children().length;

        if (countChatWindow == LIMIT_CHAT_WINDOW && LIMIT_CHAT_WINDOW != 0)
            storeChat();
        else if (LIMIT_CHAT_WINDOW < 1) {
            jQuery('#jappix_mini div.jm_conversations').prepend(html);
            storeChat();
            return false;
        }

        jQuery('#jappix_mini div.jm_conversations').prepend(html);

        // Get the presence of this friend
        getPresence(type, hash);

        // The click events
        chatEventsMini(type, xid, hash);
    }
    else if (exists('#jappix_mini #stored_friend-' + hash) && LIMIT_CHAT_WINDOW != 0) {
        storeChat();
        restoreChat(current);
        return false;
    }

    focusPane(show_pane, hash);

    return false;
}

// Focus on our pane
function focusPane(show, hash) {
    if (show != false)
        jQuery(document).oneTime(10, function () {
            switchPaneMini('chat-' + hash, hash);
        });
}

// Get the presence of this friend
function getPresence(type, hash) {
    var current = '#jappix_mini #chat-' + hash;
    if (!jQuery(current + ' a.jm_pane span').hasClass('jm_presence')) {
        var selector = jQuery('#jappix_mini a#friend-' + hash + ' span.jm_presence');

        // Default presence
        var show = 'available';

        // Read the presence
        if (selector.hasClass('jm_unavailable'))
            show = 'unavailable';
        else if (selector.hasClass('jm_chat'))
            show = 'chat';
        else if (selector.hasClass('jm_away'))
            show = 'away';
        else if (selector.hasClass('jm_xa'))
            show = 'xa';
        else if (selector.hasClass('jm_dnd'))
            show = 'dnd';

        //Verify if exists the element represent presence
        if (jQuery(current + ' a.jm_chat-tab').children().length > 1)
            jQuery(current + ' a.jm_chat-tab').children().first().remove();

        // Create the presence marker
        jQuery(current + ' a.jm_chat-tab').prepend('<span class="jm_presence jm_images jm_' + show + '"></span>');
    }
}

//rearrange chats displayed/stored on the screen in accordance with the resolution of the browser
function redefinesOnResize() {
    var opt1 = jQuery('#jappix_mini div.jm_conversations').children().length;
    var opt2 = LIMIT_CHAT_WINDOW;

    if (opt1 > opt2) {
        while (opt1 > opt2) {
            storeChat();
            opt1--;
        }
    }
    else {
        while (opt2 > opt1) {
            restoreChat();
            opt2--;
        }
    }
}

// Displays a given message
function displayMessageMini(type, body, xid, nick, hash, time, stamp, message_type) {
    // Generate path
    var path = '#chat-' + hash;

    // Can scroll?
    var cont_scroll = document.getElementById('received-' + hash);
    var can_scroll = false;

    if (!cont_scroll.scrollTop || ((cont_scroll.clientHeight + cont_scroll.scrollTop) == cont_scroll.scrollHeight))
        can_scroll = true;

    // Remove the previous message border if needed
    var last = jQuery(path + ' div.jm_group:last');
    var last_stamp = parseInt(last.attr('data-stamp'));
    var last_b = jQuery(path + ' b:last');
    var last_xid = last_b.attr('data-xid');
    var last_type = last.attr('data-type');
    var grouped = false;
    var header = '';

    if ((last_xid == xid) && (message_type == last_type) && ((stamp - last_stamp) <= 1800))
        grouped = true;

    else {
        // Write the message date
        if (nick)
            header += '<span class="jm_date">' + time + '</span>';

        // Write the buddy name at the top of the message group
        if (nick == 'me')
            header += '<b class="jm_me" data-xid="' + encodeQuotes(xid) + '">' + _e("You") + '</b>';
        else
            header += '<b class="jm_him" data-xid="' + encodeQuotes(xid) + '">' + nick.htmlEnc() + '</b>';
    }

    // Apply the /me command
    var me_command = false;

    if (body.match(/^\/me /i)) {
        body = body.replace(/^\/me /i, nick + ' ');

        // Marker
        me_command = true;
    }

    // HTML-encode the message
    body = body.htmlEnc();

    // Apply the smileys
    body = body.replace(/(;\)|;-\))(\s|$)/gi, smileyMini('wink', '$1'))
	           .replace(/(:3|:-3)(\s|$)/gi, smileyMini('waii', '$1'))
	           .replace(/(:\(|:-\()(\s|$)/gi, smileyMini('unhappy', '$1'))
	           .replace(/(:P|:-P)(\s|$)/gi, smileyMini('tongue', '$1'))
	           .replace(/(:O|:-O)(\s|$)/gi, smileyMini('surprised', '$1'))
	           .replace(/(:\)|:-\))(\s|$)/gi, smileyMini('smile', '$1'))
	           .replace(/(\^\^|\^_\^)(\s|$)/gi, smileyMini('happy', '$1'))
	           .replace(/(:D|:-D)(\s|$)/gi, smileyMini('grin', '$1'));

    // Filter the links
    body = applyLinks(body, 'mini');

    // Generate the message code
    if (me_command)
        body = '<em>' + body + '</em>';

    body = '<p>' + body + '</p>';

    var isStoredChat = jQuery('#jappix_mini #chat-' + hash).hasClass('jm_stored');

    // Create the message
    if (grouped) {
        jQuery('#jappix_mini #chat-' + hash + ' div.jm_received-messages div.jm_group:last').append(body);
        jQuery('#jappix_mini #chat-' + hash + ' div.jm_received-messages div.jm_group:last').attr('last-message', stamp);
    }
    else
        jQuery('#jappix_mini #chat-' + hash + ' div.jm_received-messages').append('<div class="jm_group jm_' + message_type + '" data-type="' + message_type + '" data-stamp="' + stamp + '" last-message="' + stamp + '">' + header + body + '</div>');

    if (isStoredChat)
        alertNewMessage();

    // Scroll to this message
    if (can_scroll)
        messageScrollMini(hash);
}

// Notifies incoming chat messages
function notifyMessageMini(hash) {
    // Define the paths
    var tab;
    if (!exists('#stored_friend-' + hash))
        tab = '#jappix_mini #chat-' + hash + ' a.jm_chat-tab';
    else
        tab = '#jappix_mini #stored_friend-' + hash + ' a.jm_stored-friend';

    var notify = tab + ' span.jm_notify';
    var notify_middle = notify + ' span.jm_notify_middle';

    // Notification box not yet added
    if (!exists(notify))
        jQuery(tab).append(
			'<span class="jm_notify">' +
				'<span class="jm_notify_left jm_images"></span>' +
				'<span class="jm_notify_middle">0</span>' +
				'<span class="jm_notify_right jm_images"></span>' +
			'</span>'
		);

    // Increment the notification number
    var number = parseInt(jQuery(notify_middle).text());
    jQuery(notify_middle).text(number + 1);
}

//Chose a chat window for store or restore if 'operation == true'
function choseChatWindow(chatArray, operation) {
    if (!operation)
        var time = getTimeStamp();
    else
        var time = -1;
    var timeStamp;
    var chatObj;
    var result;

    jQuery.each(chatArray, function (index, value) {
        var timeStamp = jQuery(value).children('.jm_chat-content').children('.jm_received-messages').children(':last').attr('last-message');

        if (!operation)
            result = time > timeStamp;
        else
            result = time < timeStamp;

        if (timeStamp && time && result) {
            time = timeStamp;
            chatObj = value;
        }
        else if (!timeStamp && !operation) {
            time = timeStamp;
            chatObj = value;
        }
        else if (time == -1 && (jQuery(chatArray).length - 1) == index) {
            time = timeStamp;
            chatObj = value;
        }
    });

    return chatObj;
}

//Store a open chat with more time of inactivity
function storeChat() {
    try {
        //Preparing the chat window to be stored
        var newDiv = choseChatWindow(jQuery('div.jm_conversations').children().toArray());
        var hash = jQuery(newDiv).attr('data-hash');
        var type = jQuery(newDiv).attr('data-type');
        var xid = jQuery(newDiv).attr('data-xid');
        var origin = jQuery(newDiv).attr('data-origin');
        var nick = unescape(jQuery(newDiv).attr('data-nick'));

        //Chat will be stored
        var chatStored = '<div class="jm_conversation jm_type_chat jm_stored" id="chat-' + hash + '" data-xid="' + escape(xid) + '" data-type="' + type + '" data-nick="' + escape(nick) + '" data-hash="' + hash + '" data-origin="' + origin + '">'
                            + jQuery(newDiv).html().toString()
                        + '</div>';

        // Element
        var element = '#jappix_mini #stored_friend-' + hash;

        // Yet added?
        if (exists(element))
            return false;

        // Append this buddy content in stored div
        var code = '<div id="stored_friend-' + hash + '">'
                        + '<a class="jm_stored-friend" data-xid="' + escape(xid) + '" data-nick="' + escape(nick) + '" data-hash="' + hash + '" href="#">'
                            + '<span>' + nick.htmlEnc() + '</span>'
                        + '</a>'
                        + chatStored
                   + '</div>';

        // Generate the path
        var path = '#jappix_mini div.jm_stored-roster div.jm_buddy-conversations';

        //Add conversation in 'reticenses' control and remove of open conversations
        jQuery(path).prepend(code);
        jQuery(newDiv).remove();

        //if exists notify messages
        var tab = '#jappix_mini #stored_friend-' + hash + ' a.jm_chat-tab span.jm_notify';
        if (exists(tab)) {
            var selectorNotify = jQuery(tab);
            jQuery('#stored_friend-' + hash + ' a.jm_stored-friend').append(selectorNotify);
            jQuery(tab).remove();
        }

        // Click event on this buddy
        jQuery(element).click(function () {
            try {
                if (jQuery('.jm_conversations').children().length <= LIMIT_CHAT_WINDOW && LIMIT_CHAT_WINDOW > 0) {
                    storeChat();

                    chatStored = jQuery('#chat-' + hash).removeClass('jm_stored');
                    jQuery('#jappix_mini div.jm_conversations').prepend(chatStored);
                    getPresence(type, hash);
                    chatEventsMini(type, xid, hash);
                    focusPane(true, hash);

                    jQuery('#stored_friend-' + hash).remove();
                }
            }
            catch (e) { }
            finally {
                emptyStoredChat();
                return false;
            }
        });
    }
    catch (e) { }
    finally {
        containsStoredChat();
        return true;
    }
}

//Restore a chat stored with less time of inactivity
function restoreChat(current) {
    try {
        //Preparing the chat window to be restored
        if (!current)
            var current = 'div.jm_conversation.jm_type_chat.jm_stored';

        var newDiv = choseChatWindow(jQuery(current).toArray(), 'restore');
        var hash = jQuery(newDiv).attr('data-hash');
        var type = jQuery(newDiv).attr('data-type');
        var xid = jQuery(newDiv).attr('data-xid');
        var origin = jQuery(newDiv).attr('data-origin');
        var nick = unescape(jQuery(newDiv).attr('data-nick'));

        // Append this buddy content
        var code = '<div class="jm_conversation jm_type_chat" id="chat-' + hash + '" data-xid="' + escape(xid) + '" data-type="' + type + '" data-nick="' + escape(nick) + '" data-hash="' + hash + '" data-origin="' + origin + '">'
                        + jQuery(newDiv).html().toString()
                 + '</div>';

        jQuery('#stored_friend-' + hash).remove();
        jQuery('#jappix_mini div.jm_conversations').prepend(code);
        getPresence(type, hash);
        chatEventsMini(type, xid, hash);
        focusPane(true, hash);
    }
    catch (e) { }
    finally {
        if (NOTIFY_USER)
            stopAlertNewMessage();
        emptyStoredChat();
        return true;
    }
}

// Shows the stored conversations
function showStoredConversations() {
    switchPaneMini('stored-roster');
    jQuery('#jappix_mini div.jm_stored-roster').show();
    jQuery('#jappix_mini a.jm_store-button').addClass('jm_clicked');
}

// Hides the stored conversations
function hideStoredConversations() {
    jQuery('#jappix_mini div.jm_stored-roster').hide();
    jQuery('#jappix_mini a.jm_store-button').removeClass('jm_clicked');
}

//Alert new messages for chats storeds
function alertNewMessage() {
    if (!jQuery('#jappix_mini a.jm_store-button').hasClass('jm_clicked') && !NOTIFY_USER) {
        ID_NOTIFY = setInterval('alertChatStored();', 700);
        NOTIFY_USER = true;
    }
}

//Break alertNewMessage()
function stopAlertNewMessage() {
    if (NOTIFY_USER) {
        clearInterval(ID_NOTIFY);
        jQuery('#jappix_mini a.jm_store-pane').removeClass('jm_notify-messages');
        NOTIFY_USER = false;
    }
}

//Function called in alertNewMessage()_setInterval()
function alertChatStored() {
    if (!jQuery('#jappix_mini a.jm_store-pane').hasClass('jm_notify-messages'))
        jQuery('#jappix_mini a.jm_store-pane').addClass('jm_notify-messages');
    else
        jQuery('#jappix_mini a.jm_store-pane').removeClass('jm_notify-messages');
}

//Validate if contains any chat stored for show the stored div
function containsStoredChat() {
    if (jQuery('div.jm_buddy-conversations').children().length > 0)
        jQuery('#jappix_mini div.jm_stored-conversations').show();
}

//Validate if chat stored is empty for hide the stored div
function emptyStoredChat() {
    if (jQuery('div.jm_buddy-conversations').children().length < 1) {
        hideStoredConversations();
        jQuery('#jappix_mini div.jm_stored-conversations').hide();
    }
}

//Event to defines the limit of open window chats on browser
window.onresize = confirmResize;
function confirmResize() {
    if (isConnected()) {
        var widthWindow = jQuery(window).width();
        var MARGIN_PLUGIN = 20;
        var widthPlugin = jQuery('.jm_starter').width() + jQuery('.jm_stored-conversations').width() + MARGIN_PLUGIN;
        LIMIT_CHAT_WINDOW = Math.floor((widthWindow - widthPlugin) / 153) - 1;

        redefinesOnResize();
    }
}