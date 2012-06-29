function LaunchDemoMini()
{
    // Create the Jappix Mini DOM content
    createDemoMini();
}

// Creates the Jappix Mini DOM content
function createDemoMini() {
    
   	var dom = '<div class="jm_position">' +
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
						  '<a class="jm_config-action jm_join jm_images" title="' + _e("") + '" href="#"></a>' +
					  '</div>' +

					  '<div class="jm_buddies"></div>' +
				  '</div>' +

				  '<a class="jm_pane jm_button jm_images" href="#">' +
					  '<span class="jm_counter jm_images"></span>' +
				  '</a>' +
			'</div>' +
		'</div>';

    // Create the DOM
    jQuery('body').append('<div id="jappix_mini">' + dom + '</div>');

    // Adapt roster height
    adaptRosterMini();

    // The click events roster div
    jQuery('#jappix_mini a.jm_button').click(function () {
        // Using a try/catch override IE issues
        
            // Presence counter
            var counter = '#jappix_mini a.jm_pane.jm_button span.jm_counter';

            // Cannot open the roster?
            if (jQuery(counter).text() == _e("..."))
                return false;

            // Not yet connected?
            if (jQuery(counter).text() == _e("Chat")) {
                // Add a waiting marker
                jQuery(counter).text(_e("..."));

				 setTimeout("jQuery('"+counter+"').text(_e('6')); addBuddyDemoMini('6','6','echo6');addBuddyDemoMini('5','5','echo5');addBuddyDemoMini('4','4','echo4'); addBuddyDemoMini('3','3','echo3');addBuddyDemoMini('2','2','echo2');addBuddyDemoMini('1','1','echo1');",1000);
				
                return false;
            }

            // Normal actions
            if (!jQuery(this).hasClass('jm_clicked'))
                showRosterMini();
            else
                hideRosterMini();
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

    jQuery('#jappix_mini a.jm_pane.jm_button span.jm_counter').text(_e("Chat"));

    //Defines limit for chat opened on window
    var widthWindow = jQuery(window).width();
    var MARGIN_PLUGIN = 20;
    var widthPlugin = jQuery('.jm_starter').width() + jQuery('.jm_stored-conversations').width() + MARGIN_PLUGIN;
    LIMIT_CHAT_WINDOW = Math.floor((widthWindow - widthPlugin) / 153) - 1;
	loginWithoutClick();
}

function loginWithoutClick(){
	// Presence counter
	var counter = '#jappix_mini a.jm_pane.jm_button span.jm_counter';

	// Cannot open the roster?
	if (jQuery(counter).text() == _e("..."))
		return false;

	// Not yet connected?
	if (jQuery(counter).text() == _e("Chat")) {
		// Add a waiting marker
		jQuery(counter).text(_e("..."));

		 setTimeout("jQuery('"+counter+"').text(_e('6')); addBuddyDemoMini('6','6','echo6');addBuddyDemoMini('5','5','echo5');addBuddyDemoMini('4','4','echo4'); addBuddyDemoMini('3','3','echo3');addBuddyDemoMini('2','2','echo2');addBuddyDemoMini('1','1','echo1');",1000);
		
		return false;
	}

	// Normal actions
	if (!jQuery(this).hasClass('jm_clicked'))
		showRosterMini();
	else
		hideRosterMini();
}

// Displays a roster buddy
function addBuddyDemoMini(xid, hash, nick) {
    // Element
    var element = '#jappix_mini a.jm_friend#friend-' + hash;

    // Yet added?
    if (exists(element))
        return false;

    // Generate the path
    var path = '#jappix_mini div.jm_roster div.jm_buddies';

    // Append this buddy content
    var code = '<a class="jm_friend jm_online" id="friend-' + hash + '" data-xid="' + escape(xid) + '" data-nick="' + escape(nick) + '" data-hash="' + hash + '" href="#"><span class="jm_presence jm_images jm_available"></span>' + nick.htmlEnc() + '</a>';

    jQuery(path).prepend(code);

    // Click event on this buddy
    jQuery(element).click(function () {
        // Using a try/catch override IE issues
        
            chatDemoMini('chat', xid, nick, hash);
        return false;
    });

    return true;
}

// Manages and creates a chat
function chatDemoMini(type, xid, nick, hash, pwd, show_pane) {
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
    			'<span class="jm_presence jm_images jm_available"></span>'+
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

        // The click events
        chatEventsDemoMini(type, xid, hash);
    }
    else if (exists('#jappix_mini #stored_friend-' + hash) && LIMIT_CHAT_WINDOW != 0) {
        storeChat();
        restoreChat(current);
        return false;
    }

    focusPane(show_pane, hash);

    return false;
}

// Sends a given message
function sendMessageDemoMini(aForm) {
    
	var body = trim(aForm.body.value);
	var xid = aForm.xid.value;
	var type = aForm.type.value;
	var hash = xid;

	if (body && xid) {
		try{	
			// Clear the input
			aForm.body.value = '';

			// Display the message we sent
			displayMessageMini(type, body, 'me@me', 'me', hash, getCompleteTime(), getTimeStamp(), 'user-message');
			
			setTimeout("handleMessageDemoMini('"+body+"','"+hash+"');",parseInt(hash)*500);
		}
		catch(e){
			console.log(e)
		}	
	}
    
}

// Events on the chat tool
function chatEventsDemoMini(type, xid, hash) {
    var current = '#jappix_mini #chat-' + hash;

    // Submit the form
    jQuery(current + ' form').submit(function () {
        sendMessageDemoMini(this);
		return false;
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

function handleMessageDemoMini(body, hash) {
    
	var use_xid = hash+'@me';	
	var nick = 'echo'+hash;

	// Message type
	var message_type = 'user-message';

	// Chat values
	nick = jQuery('#jappix_mini a#friend-' + hash).text().revertHtmlEnc();

	// Define the target div
	var target = '#jappix_mini #chat-' + hash;

	// Create the chat if it does not exist
	if (!exists(target))
		chatDemoMini('chat', xid, nick, hash);

	// Display the message
	displayMessageMini('chat', body, use_xid, nick, hash, getCompleteTime(), getTimeStamp(), message_type);

	// Notify the user if not focused
	if ((!jQuery(target + ' a.jm_chat-tab').hasClass('jm_clicked') || !isFocused()) && (message_type == 'user-message'))
		notifyMessageMini(hash);
    
}