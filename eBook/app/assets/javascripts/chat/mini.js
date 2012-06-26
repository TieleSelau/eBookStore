/*

Jappix - An open social platform
These are the Jappix Mini JS scripts for Jappix

-------------------------------------------------
 
License: AGPL
Author: Valérian Saliou
Modified by: Gregory Silva
Last revision: 01/08/11

*/

// Jappix Mini vars
var MINI_DISCONNECT = false;
var MINI_AUTOCONNECT = false;
var MINI_SHOWPANE = false;
var MINI_INITIALIZED = false;
var MINI_ANONYMOUS = false;
var MINI_NICKNAME = null;
var MINI_TITLE = null;
var MINI_DOMAIN = null;
var MINI_USER = null;
var MINI_PASSWORD = null;
var MINI_RECONNECT = 0;
var MINI_PASSWORDS = [];
var MINI_RESOURCE = JAPPIX_RESOURCE + ' Mini';

// Setups connection handlers
function setupConMini(con) {
    con.registerHandler('message', handleMessageMini);
    con.registerHandler('presence', handlePresenceMini);
    con.registerHandler('iq', handleIQMini);
    con.registerHandler('onerror', handleErrorMini);
    con.registerHandler('onconnect', connectedMini);
}

// Connects the user with the given logins
function connectMini(domain, user, password) {
    try {
        // We define the http binding parameters
        oArgs = new Object();

        if (HOST_BOSH_MINI)
            oArgs.httpbase = HOST_BOSH_MINI;
        else
            oArgs.httpbase = HOST_BOSH;

        // We create the new http-binding connection
        con = new JSJaCHttpBindingConnection(oArgs);

        // And we handle everything that happen
        setupConMini(con);

        // Generate a resource
        var random_resource = getDB('jappix-mini', 'resource');

        if (!random_resource)
            random_resource = MINI_RESOURCE + ' (' + (new Date()).getTime() + ')';

        // We retrieve what the user typed in the login inputs
        oArgs = new Object();
        oArgs.secure = true;
        oArgs.xmllang = XML_LANG;
        oArgs.resource = random_resource;
        oArgs.domain = domain;

        // Store the resource (for reconnection)
        setDB('jappix-mini', 'resource', random_resource);

        // Anonymous login?
        if (MINI_ANONYMOUS) {
            // Anonymous mode disabled?
            if (!allowedAnonymous()) {
                logThis('Not allowed to use anonymous mode.', 2);

                // Notify this error
                notifyErrorMini();

                return false;
            }

            // Bad domain?
            else if (lockHost() && (domain != HOST_ANONYMOUS)) {
                logThis('Not allowed to connect to this anonymous domain: ' + domain, 2);

                // Notify this error
                notifyErrorMini();

                return false;
            }

            oArgs.authtype = 'saslanon';
        }

        // Normal login
        else {
            // Bad domain?
            if (lockHost() && (domain != HOST_MAIN)) {
                logThis('Not allowed to connect to this main domain: ' + domain, 2);

                // Notify this error
                notifyErrorMini();

                return false;
            }

            // No nickname?
            if (!MINI_NICKNAME)
                MINI_NICKNAME = user;

            oArgs.username = user;
            oArgs.pass = password;
        }

        // We connect !
        con.connect(oArgs);

        logThis('Jappix Mini is connecting...', 3);
    }

    catch (e) {
        // Logs errors
        logThis('Error while logging in: ' + e, 1);

        // Reset Jappix Mini
        disconnectedMini();
    }

    finally {
        return false;
    }
}

// When the user is connected
function connectedMini() {
    // Update the roster
    jQuery('#jappix_mini a.jm_pane.jm_button span.jm_counter').text('0');

    // Do not get the roster if anonymous
    if (MINI_ANONYMOUS)
        initializeMini();
    else
        getRosterMini();

    // For logger
    if (MINI_RECONNECT)
        logThis('Jappix Mini is now reconnected.', 3);
    else
        logThis('Jappix Mini is now connected.', 3);

    // Reset reconnect var
    MINI_RECONNECT = 0;
}

// When the user disconnects
function saveSessionMini() {
    // Not connected?
    if (!isConnected())
        return;

    // Save the actual Jappix Mini DOM
    setDB('jappix-mini', 'dom', jQuery('#jappix_mini').html());
    setDB('jappix-mini', 'nickname', MINI_NICKNAME);

    // Save the scrollbar position
    var scroll_position = '';
    var scroll_hash = jQuery('#jappix_mini div.jm_conversation:has(a.jm_pane.jm_clicked)').attr('data-hash');

    if (scroll_hash)
        scroll_position = document.getElementById('received-' + scroll_hash).scrollTop + '';

    setDB('jappix-mini', 'scroll', scroll_position);

    // Save the session stamp
    setDB('jappix-mini', 'stamp', getTimeStamp());

    // Suspend connection
    con.suspend(false);

    handleClose();

    logThis('Jappix Mini session save tool launched.', 3);
}

// Disconnects the connected user
function disconnectMini() {
    // No connection?
    if (!isConnected())
        return false;

    // Change markers
    MINI_DISCONNECT = true;
    MINI_INITIALIZED = false;

    // Add disconnection handler
    con.registerHandler('ondisconnect', disconnectedMini);

    // Disconnect the user
    con.disconnect();

    logThis('Jappix Mini is disconnecting...', 3);

    return false;
}

// When the user is disconnected
function disconnectedMini() {
    // Remove the stored items
    removeDB('jappix-mini', 'dom');
    removeDB('jappix-mini', 'nickname');
    removeDB('jappix-mini', 'scroll');
    removeDB('jappix-mini', 'stamp');

    // Connection error?
    if (!MINI_DISCONNECT || MINI_INITIALIZED) {
        // Browser error?
        logThis('Connection error');
        notifyErrorMini();

        // Reset reconnect timer
        jQuery('#jappix_mini').stopTime();

        // Try to reconnect after a while
        if (MINI_INITIALIZED && (MINI_RECONNECT < 5)) {
            // Reconnect interval
            var reconnect_interval = 10;

            if (MINI_RECONNECT)
                reconnect_interval = (5 + (5 * MINI_RECONNECT)) * 1000;

            MINI_RECONNECT++;

            // Set timer
            jQuery('#jappix_mini').oneTime(reconnect_interval, function () {
                launchMini(true, MINI_SHOWPANE, MINI_DOMAIN, MINI_USER, MINI_PASSWORD);
            });
        }
    }

    // Normal disconnection?
    else
        launchMini(false, MINI_SHOWPANE, MINI_DOMAIN, MINI_USER, MINI_PASSWORD);

    // Reset markers
    MINI_DISCONNECT = false;
    MINI_INITIALIZED = false;

    logThis('Jappix Mini is now disconnected.', 3);
}

// Handles the incoming messages
function handleMessageMini(msg) {
    var type = msg.getType();

    // This is a message Jappix can handle
    if ((type == 'chat') || (type == 'normal') || !type) {
        // Get the body
        var body = trim(msg.getBody());

        // Any subject?
        var subject = trim(msg.getSubject());

        if (subject)
            body = subject;

        if (body) {
            // Get the values
            var from = fullXID(getStanzaFrom(msg));
            var xid = bareXID(from);
            var use_xid = xid;
            var hash = hex_md5(xid);
            var nick = thisResource(from);

            // Read the delay
            var delay = readMessageDelay(msg.getNode());
            var d_stamp;

            // Manage this delay
            if (delay) {
                time = relativeDate(delay);
                d_stamp = Date.jab2date(delay);
            }

            else {
                time = getCompleteTime();
                d_stamp = new Date();
            }

            // Get the stamp
            var stamp = extractStamp(d_stamp);

            // Message type
            var message_type = 'user-message';

            // Chat values
            nick = jQuery('#jappix_mini a#friend-' + hash).text().revertHtmlEnc();

            // No nickname?
            if (!nick)
                nick = getXIDNick(xid);

            // Define the target div
            var target = '#jappix_mini #chat-' + hash;

            // Create the chat if it does not exist
            if (!exists(target))
                chatMini(type, xid, nick, hash);

            // Display the message
            displayMessageMini(type, body, use_xid, nick, hash, time, stamp, message_type);

            // Notify the user if not focused
            if ((!jQuery(target + ' a.jm_chat-tab').hasClass('jm_clicked') || !isFocused()) && (message_type == 'user-message'))
                notifyMessageMini(hash);

            logThis('Message received from: ' + from);
        }
    }
}

// Handles the incoming IQs
function handleIQMini(iq) {
    // Define some variables
    var iqFrom = fullXID(getStanzaFrom(iq));
    var iqID = iq.getID();
    var iqQueryXMLNS = iq.getQueryXMLNS();
    var iqType = iq.getType();
    var iqNode = iq.getNode();

    // Build the response
    var iqResponse = new JSJaCIQ();

    iqResponse.setID(iqID);
    iqResponse.setTo(iqFrom);
    iqResponse.setType('result');

    // Software version query
    if ((iqQueryXMLNS == NS_VERSION) && (iqType == 'get')) {
        /* REF: http://xmpp.org/extensions/xep-0092.html */

        var iqQuery = iqResponse.setQuery(NS_VERSION);

        iqQuery.appendChild(iq.buildNode('name', { 'xmlns': NS_VERSION }, 'Jappix Mini'));
        iqQuery.appendChild(iq.buildNode('version', { 'xmlns': NS_VERSION }, JAPPIX_VERSION));
        iqQuery.appendChild(iq.buildNode('os', { 'xmlns': NS_VERSION }, BrowserDetect.OS));

        con.send(iqResponse);

        logThis('Received software version query: ' + iqFrom);
    }

    // Roster push
    else if ((iqQueryXMLNS == NS_ROSTER) && (iqType == 'set')) {
        // Display the friend
        handleRosterMini(iq);

        con.send(iqResponse);

        logThis('Received a roster push.');
    }

    // Disco info query
    else if ((iqQueryXMLNS == NS_DISCO_INFO) && (iqType == 'get')) {
        /* REF: http://xmpp.org/extensions/xep-0030.html */

        var iqQuery = iqResponse.setQuery(NS_DISCO_INFO);

        // We set the name of the client
        iqQuery.appendChild(iq.appendNode('identity', {
            'category': 'client',
            'type': 'web',
            'name': 'Jappix Mini',
            'xmlns': NS_DISCO_INFO
        }));

        // We set all the supported features
        var fArray = new Array(
			NS_DISCO_INFO,
			NS_VERSION,
			NS_ROSTER,
			NS_MUC,
			NS_VERSION,
			NS_URN_TIME
		);

        for (i in fArray)
            iqQuery.appendChild(iq.buildNode('feature', { 'var': fArray[i], 'xmlns': NS_DISCO_INFO }));

        con.send(iqResponse);

        logThis('Received a disco#infos query.');
    }

    // User time query
    else if (jQuery(iqNode).find('time').size() && (iqType == 'get')) {
        /* REF: http://xmpp.org/extensions/xep-0202.html */

        var iqTime = iqResponse.appendNode('time', { 'xmlns': NS_URN_TIME });
        iqTime.appendChild(iq.buildNode('tzo', { 'xmlns': NS_URN_TIME }, getDateTZO()));
        iqTime.appendChild(iq.buildNode('utc', { 'xmlns': NS_URN_TIME }, getXMPPTime('utc')));

        con.send(iqResponse);

        logThis('Received local time query: ' + iqFrom);
    }
}

// Handles the incoming errors
function handleErrorMini(err) {
    // First level error (connection error)
    if (jQuery(err).is('error')) {
        // Notify this error
        disconnectedMini();

        logThis('First level error received.' + err.toString(), 1);
    }
}

// Handles the incoming presences
function handlePresenceMini(pr) {
    // Get the values
    var from = fullXID(getStanzaFrom(pr));
    var xid = bareXID(from);
    var resource = thisResource(from);
    var hash = hex_md5(xid);
    var type = pr.getType();
    var show = pr.getShow();

    // Manage the received presence values
    if ((type == 'error') || (type == 'unavailable'))
        show = 'unavailable';

    else {
        switch (show) {
            case 'chat':
            case 'away':
            case 'xa':
            case 'dnd':
                break;

            default:
                show = 'available';

                break;
        }
    }

    // Friend path
    var chat = '#jappix_mini #chat-' + hash;
    var friend = '#jappix_mini a#friend-' + hash;
    var send_input = chat + ' input.jm_send-messages';

    // Is this friend online?
    if (show == 'unavailable') {
        // Offline marker
        jQuery(friend).addClass('jm_offline').removeClass('jm_online');

        // Disable the chat tools
        jQuery(chat).addClass('jm_disabled');
        jQuery(send_input).attr('disabled', true).attr('data-value', _e("Unavailable")).val(_e("Unavailable"));
    }

    else {
        // Online marker
        jQuery(friend).removeClass('jm_offline').addClass('jm_online');

        // Enable the chat input
        jQuery(chat).removeClass('jm_disabled');
        jQuery(send_input).removeAttr('disabled').val('');
    }

    // Change the show presence of this buddy
    jQuery(friend + ' span.jm_presence, ' + chat + ' span.jm_presence').attr('class', 'jm_presence jm_images jm_' + show);

    // Update the presence counter
    updateRosterMini();

    logThis('Presence received from: ' + from);
}

// Updates the user presence
function presenceMini(type, show, priority, status, to, password, limit_history, handler) {
    var pr = new JSJaCPresence();

    // Add the attributes
    if (to)
        pr.setTo(to);
    if (type)
        pr.setType(type);
    if (show)
        pr.setShow(show);
    if (priority)
        pr.setPriority(priority);
    if (status)
        pr.setStatus(status);

    // Special presence elements
    if (password || limit_history) {
        var x = pr.appendNode('x', { 'xmlns': NS_MUC });

        // Any password?
        if (password)
            x.appendChild(pr.buildNode('password', { 'xmlns': NS_MUC }, password));

        // Any history limit?
        if (limit_history)
            x.appendChild(pr.buildNode('history', { 'maxstanzas': 10, 'seconds': 86400, 'xmlns': NS_MUC }));
    }

    // Send the packet
    if (handler)
        con.send(pr, handler);
    else
        con.send(pr);

    // No type?
    if (!type)
        type = 'available';

    logThis('Presence sent: ' + type, 3);
}

// Sends a given message
function sendMessageMini(aForm) {
    try {
        var body = trim(aForm.body.value);
        var xid = aForm.xid.value;
        var type = aForm.type.value;
        var hash = hex_md5(xid);

        if (body && xid) {
            // Send the message
            var aMsg = new JSJaCMessage();

            aMsg.setTo(xid);
            aMsg.setType(type);
            aMsg.setBody(body);

            con.send(aMsg);

            // Clear the input
            aForm.body.value = '';

            // Display the message we sent
            displayMessageMini(type, body, getXID(), 'me', hash, getCompleteTime(), getTimeStamp(), 'user-message');

            logThis('Message (' + type + ') sent to: ' + xid);
        }
    }

    catch (e) { }

    finally {
        return false;
    }
}

// Generates the asked smiley image
function smileyMini(image, text) {
    return ' <img class="jm_smiley jm_smiley-' + image + ' jm_images" alt="' + encodeQuotes(text) + '" src="../../App_Themes/darkOrange/images/Chat/blank.gif" /> ';
}

// Notifies the user from a session error
function notifyErrorMini() {
    // Replace the Jappix Mini DOM content
    jQuery('#jappix_mini').html(
		'<div class="jm_starter">' +
			'<a class="jm_pane jm_button jm_images" href="http://prisma/nopcommercestore_chatatheneum/contactus.aspx" target="_blank" title="' + _e("Clique aqui e reporte seu erro.") + '">' +
				'<span class="jm_counter jm_error jm_images">' + _e("Error") + '</span>' +
			'</a>' +
		'</div>'
	);
}

// Clears the notifications
function clearNotificationsMini(hash) {
    // Not focused?
    if (!isFocused())
        return false;

    // Remove the notifications counter
    jQuery('#jappix_mini #chat-' + hash + ' span.jm_notify').remove();

    return true;
}

// Updates the roster counter
function updateRosterMini() {
    jQuery('#jappix_mini a.jm_button span.jm_counter').text(jQuery('#jappix_mini a.jm_online').size());
}

// Creates the Jappix Mini DOM content
function createMini(domain, user, password) {
    // Try to restore the DOM
    var dom = getDB('jappix-mini', 'dom');
    var stamp = parseInt(getDB('jappix-mini', 'stamp'));
    var suspended = false;

    // Invalid stored DOM?
    if (dom && isNaN(jQuery(dom).find('a.jm_pane.jm_button span.jm_counter').text()))
        dom = null;

    // Can resume a session?
    con = new JSJaCHttpBindingConnection();
    setupConMini(con);

    // Old DOM?
    if (dom && ((getTimeStamp() - stamp) < JSJACHBC_MAX_WAIT * 5) && con.resume()) { // var JSJACHBC_MAX_WAIT is multiplied by 5, because this "if" needs the return value of the variable is greater than '100 '
        // Read the old nickname
        MINI_NICKNAME = getDB('jappix-mini', 'nickname');

        // Marker
        suspended = true;
    }

    // New DOM?
    else {
        dom = '<div class="jm_position">' +
                  '<div class="jm_stored-conversations">' +
                     '<div class="jm_stored-roster">' +
					     '<div class="jm_buddy-conversations"></div>' +
				     '</div>' +
                     '<a class="jm_store-pane jm_store-button" href="#">' +
                        '<span>' + _e("...") + '</span>' +
                     '</a>' +
                   '</div>' +
			      '<div class="jm_conversations"></div>' +
			      '<div class="jm_starter">' +
				      '<div class="jm_roster">' +
					      '<div class="jm_actions">' +
						      '<a class="jm_logo jm_images" href="" target="_blank"></a>' +
		                      '<a class="jm_one-action jm_join jm_images" title="' + _e("") + '" href="#"></a>' +
					      '</div>' +

					      '<div class="jm_buddies"></div>' +
				      '</div>' +

				      '<a class="jm_pane jm_button jm_images" href="#">' +
					      '<span class="jm_counter jm_images"></span>' +
			          '</a>' +
			    '</div>' +
            '</div>';
    }

    // Create the DOM
    jQuery('body').append('<div id="jappix_mini">' + dom + '</div>');

    // Adapt roster height
    adaptRosterMini();

    // The click events roster div
    jQuery('#jappix_mini a.jm_button').click(function () {
        // Using a try/catch override IE issues
        try {
            // Presence counter
            var counter = '#jappix_mini a.jm_pane.jm_button span.jm_counter';

            // Cannot open the roster?
            if (jQuery(counter).text() == _e("Please wait..."))
                return false;

            // Not yet connected?
            if (jQuery(counter).text() == _e("Chat")) {
                // Add a waiting marker
                jQuery(counter).text(_e("Please wait..."));

                // Launch the connection!
                connectMini(domain, user, password);

                return false;
            }

            // Normal actions
            if (!jQuery(this).hasClass('jm_clicked'))
                showRosterMini();
            else
                hideRosterMini();
        }

        catch (e) { }

        finally {
            return false;
        }
    });

    // The click events stored-roster div
    jQuery('#jappix_mini a.jm_store-button').click(function () {
        try {

            stopAlertNewMessage();

            // Normal actions
            if (!jQuery(this).hasClass('jm_clicked'))
                showStoredConversations();
            else
                hideStoredConversations();
        }
        catch (e) { }
        finally {
            return false;
        }
    });

    //EVENTO A SER IMPLEMENTADO: SELEÇÃO DE STATUS DO USUÁRIO
    jQuery('#jappix_mini div.jm_actions a.jm_join').click(function () {

    });

    // Hides the roster when clicking away of Jappix Mini
    jQuery(document).click(function (evt) {
        if (!jQuery(evt.target).parents('#jappix_mini').size() && !exists('#jappix_popup'))
            hideRosterMini();
    });

    // Hides the stored-roster when clicking away of Jappix Mini
    jQuery(document).click(function (evt) {
        if (!jQuery(evt.target).parents('#jappix_mini').size() && !exists('#jappix_popup'))
            hideStoredConversations();
    });

    // Hides all panes double clicking away of Jappix Mini
    jQuery(document).dblclick(function (evt) {
        if (!jQuery(evt.target).parents('#jappix_mini').size() && !exists('#jappix_popup'))
            switchPaneMini();
    });

    // Suspended session resumed?
    if (suspended) {
        // Initialized marker
        MINI_INITIALIZED = true;

        // Restore chat input values
        jQuery('#jappix_mini div.jm_conversation input.jm_send-messages').each(function () {
            var chat_value = jQuery(this).attr('data-value');

            if (chat_value)
                jQuery(this).val(chat_value);
        });

        // Restore buddy click events
        jQuery('#jappix_mini a.jm_friend').click(function () {
            // Using a try/catch override IE issues
            try {
                chatMini('chat', unescape(jQuery(this).attr('data-xid')), unescape(jQuery(this).attr('data-nick')), jQuery(this).attr('data-hash'));
            }

            catch (e) { }

            finally {
                return false;
            }
        });

        // Restore chat click events
        jQuery('#jappix_mini div.jm_conversation').each(function () {
            chatEventsMini(jQuery(this).attr('data-type'), unescape(jQuery(this).attr('data-xid')), jQuery(this).attr('data-hash'));
        });

        // Scroll down to the last message
        var scroll_hash = jQuery('#jappix_mini div.jm_conversation:has(a.jm_pane.jm_clicked)').attr('data-hash');
        var scroll_position = getDB('jappix-mini', 'scroll');

        // Any scroll position?
        if (scroll_position)
            scroll_position = parseInt(scroll_position);

        if (scroll_hash) {
            // Use a timer to override the DOM lag issue
            jQuery(document).oneTime(200, function () {
                messageScrollMini(scroll_hash, scroll_position);
            });
        }
    }

    // Can auto-connect?
    else if (MINI_AUTOCONNECT)
        connectMini(domain, user, password);

    // Cannot auto-connect?
    else
    // Chat text
        jQuery('#jappix_mini a.jm_pane.jm_button span.jm_counter').text(_e("Chat"));

    //Defines limit for chat opened on window
    var widthWindow = jQuery(window).width();
    var MARGIN_PLUGIN = 20;
    var widthPlugin = jQuery('.jm_starter').width() + jQuery('.jm_stored-conversations').width() + MARGIN_PLUGIN;
    LIMIT_CHAT_WINDOW = Math.floor((widthWindow - widthPlugin) / 153) - 1;
}

// Switches to a given point
function switchPaneMini(element, hash) {
    // Hide every item
    jQuery('#jappix_mini a.jm_pane, #jappix_mini a.jm_store-pane').removeClass('jm_clicked');
    jQuery('#jappix_mini div.jm_roster, #jappix_mini div.jm_chat-content, #jappix_mini div.jm_stored-roster').hide();

    // Show the asked element
    if (element && (element != 'roster' || element != 'stored-roster')) {
        var current = '#jappix_mini #' + element;

        jQuery(current + ' a.jm_pane').addClass('jm_clicked');
        jQuery(current + ' div.jm_chat-content').show();

        // Use a timer to override the DOM lag issue
        jQuery(document).oneTime(10, function () {
            jQuery(current + ' input.jm_send-messages').focus();
        });

        // Scroll to the last message
        if (hash)
            messageScrollMini(hash);
    }
}

// Scrolls to the last chat message
function messageScrollMini(hash, position) {
    var id = document.getElementById('received-' + hash);

    // No defined position?
    if (!position)
        position = id.scrollHeight;

    id.scrollTop = position;
}

// Events on the chat tool
function chatEventsMini(type, xid, hash) {
    var current = '#jappix_mini #chat-' + hash;

    // Submit the form
    jQuery(current + ' form').submit(function () {
        return sendMessageMini(this);
    });

    // Click on the tab
    jQuery(current + ' a.jm_chat-tab').click(function () {
        // Using a try/catch override IE issues
        try {
            // Not yet opened: open it!
            if (!jQuery(this).hasClass('jm_clicked')) {
                // Show it!
                switchPaneMini('chat-' + hash, hash);

                // Clear the eventual notifications
                clearNotificationsMini(hash);
            }

            // Yet opened: close it!
            else
                switchPaneMini();
        }

        catch (e) { }

        finally {
            return false;
        }
    });

    // Click on the close button
    jQuery(current + ' a.jm_close').click(function () {
        // Using a try/catch override IE issues
        try {
            jQuery(current).remove();

            if (jQuery('div.jm_buddy-conversations').children().length > 0)
                restoreChat();

        }

        catch (e) { }

        finally {
            return false;
        }
    });

    // Click on the chat content
    jQuery(current + ' div.jm_received-messages').click(function () {
        try {
            jQuery(document).oneTime(10, function () {
                jQuery(current + ' input.jm_send-messages').focus();
            });
        }

        catch (e) { }
    });

    // Focus on the chat input
    jQuery(current + ' input.jm_send-messages').focus(function () {
        clearNotificationsMini(hash);
    })

    // Change on the chat input
	.keyup(function () {
	    jQuery(this).attr('data-value', jQuery(this).val());
	});
}

// Shows the roster
function showRosterMini() {
    switchPaneMini('roster');
    jQuery('#jappix_mini div.jm_roster').show();
    jQuery('#jappix_mini a.jm_button').addClass('jm_clicked');
}

// Hides the roster
function hideRosterMini() {
    jQuery('#jappix_mini div.jm_roster').hide();
    jQuery('#jappix_mini a.jm_button').removeClass('jm_clicked');
}

// Initializes Jappix Mini
function initializeMini() {
    // Update the marker
    MINI_INITIALIZED = true;

    // Send the initial presence
    if (!MINI_ANONYMOUS)
        presenceMini();

    // Must show the roster?
    if (!MINI_AUTOCONNECT)
        jQuery(document).oneTime(10, function () {
            showRosterMini();
        });
}

// Displays a roster buddy
function addBuddyMini(xid, hash, nick) {
    // Element
    var element = '#jappix_mini a.jm_friend#friend-' + hash;

    // Yet added?
    if (exists(element))
        return false;

    // Generate the path
    var path = '#jappix_mini div.jm_roster div.jm_buddies';

    // Append this buddy content
    var code = '<a class="jm_friend jm_offline" id="friend-' + hash + '" data-xid="' + escape(xid) + '" data-nick="' + escape(nick) + '" data-hash="' + hash + '" href="#"><span class="jm_presence jm_images jm_unavailable"></span>' + nick.htmlEnc() + '</a>';

    jQuery(path).prepend(code);

    // Click event on this buddy
    jQuery(element).click(function () {
        // Using a try/catch override IE issues
        try {
            chatMini('chat', xid, nick, hash);
        }

        catch (e) { }

        finally {
            return false;
        }
    });

    return true;
}

// Removes a roster buddy
function removeBuddyMini(hash) {
    // Remove the buddy from the roster
    jQuery('#jappix_mini a.jm_friend#friend-' + hash).remove();

    return true;
}

// Gets the user's roster
function getRosterMini() {
    var iq = new JSJaCIQ();
    iq.setType('get');
    iq.setQuery(NS_ROSTER);
    con.send(iq, handleRosterMini);

    logThis('Getting roster...', 3);
}

// Handles the user's roster
function handleRosterMini(iq) {
    // Parse the roster
    jQuery(iq.getQuery()).find('item').each(function () {
        // Get the values
        var current = jQuery(this);
        var xid = current.attr('jid');
        var subscription = current.attr('subscription');

        // Not a gateway
        if (!isGateway(xid)) {
            var nick = current.attr('name');
            var hash = hex_md5(xid);

            // No name is defined?
            if (!nick)
                nick = getXIDNick(xid);

            // Action on the current buddy
            if (subscription == 'remove')
                removeBuddyMini(hash);
            else
                addBuddyMini(xid, hash, nick);
        }
    });

    // Not yet initialized
    if (!MINI_INITIALIZED)
        initializeMini();

    logThis('Roster got.', 3);
}

// Adapts the roster height to the window
function adaptRosterMini() {
    // Process the new height
    var height = jQuery(window).height() - 70;

    // Apply the new height
    jQuery('#jappix_mini div.jm_roster div.jm_buddies').css('max-height', height);
}

// Plugin launcher
function launchMini(autoconnect, show_pane, domain, user, password) {
    // Save infos to reconnect
    MINI_DOMAIN = domain;
    MINI_USER = user;
    MINI_PASSWORD = password;

    MINI_ANONYMOUS = false;

    // Autoconnect (only if storage available to avoid floods)?
    if (autoconnect && hasDB())
        MINI_AUTOCONNECT = true;
    else
        MINI_AUTOCONNECT = false;

    // Show pane?
    if (show_pane)
        MINI_SHOWPANE = true;
    else
        MINI_SHOWPANE = false;

    // Remove Jappix Mini
    jQuery('#jappix_mini').remove();

    // Reconnect?
    if (MINI_RECONNECT) {
        logThis('Trying to reconnect (try: ' + MINI_RECONNECT + ')!');

        return createMini(domain, user, password);
    }

    // Disables the browser HTTP-requests stopper
    jQuery(document).keydown(function (e) {
        if ((e.keyCode == 27) && !isDeveloper())
            return false;
    });

    // Save the page title
    MINI_TITLE = document.title;

    // Sets the good roster max-height
    jQuery(window).resize(adaptRosterMini);

    // Logouts when Jappix is closed
    if (BrowserDetect.browser == 'Opera') {
        // Emulates onbeforeunload on Opera (link clicked)
        jQuery('a[href]:not([onclick])').click(function () {
            // Link attributes
            var href = jQuery(this).attr('href') || '';
            var target = jQuery(this).attr('target') || '';

            // Not new window or JS link
            if (href && !href.match(/^#/i) && !target.match(/_blank|_new/i))
                saveSessionMini();
        });

        // Emulates onbeforeunload on Opera (form submitted)
        jQuery('form:not([onsubmit])').submit(saveSessionMini);
    }

    jQuery(window).bind('beforeunload', saveSessionMini);

    // Create the Jappix Mini DOM content
    createMini(domain, user, password);

    logThis('Welcome to Jappix Mini! Happy coding in developer mode!');
}