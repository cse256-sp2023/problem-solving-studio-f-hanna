// ---- Define your dialogs  and panels here ----
var panel = define_new_effective_permissions("panel", true);
$("#sidepanel").append(panel)

// $('#sidepanel').attr('filepath', '/C')

// ADDING A NEW USER

var newUser = define_new_user_select_field("new_user", "Show User Permissions", function(selected_user) { 
    $('#panel').attr('filepath', '/C/presentation_documents/important_file.txt')
    $('#panel').attr('username', selected_user);
})
$("#sidepanel").append(newUser)


// DIALOG FUNC

var dialog = define_new_dialog("dialog", 'Permissions')

$(".perm_info").click(function(){
    console.log('clicked!')
    $( "#dialog" ).dialog("open");

    // console log - step 3
    // console.log($("#panel").attr('filepath'))
    // console.log($("#panel").attr('username'))
    // console.log($(this).attr('permission_name'))   

    // step 4
    var file_path = $("#panel").attr('filepath')
    var username = $("#panel").attr('username')
    var perm_name = $(this).attr('permission_name')

    var file_obj = path_to_file[file_path]
    var user_obj = all_users[username]

    var explanation = allow_user_action(file_obj, user_obj, perm_name, true)
    var explanation_text = get_explanation_text(explanation)

    dialog.text(explanation_text)


})




// ---- Display file structure ----

// (recursively) makes and returns an html element (wrapped in a jquery object) for a given file object
function make_file_element(file_obj) {
    let file_hash = get_full_path(file_obj)

    if(file_obj.is_folder) {
        let folder_elem = $(`<div class='folder' id="${file_hash}_div">
            <h3 id="${file_hash}_header">
                <span class="oi oi-folder" id="${file_hash}_icon"/> ${file_obj.filename} 
                <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                    <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
                </button>
            </h3>
        </div>`)

        // append children, if any:
        if( file_hash in parent_to_children) {
            let container_elem = $("<div class='folder_contents'></div>")
            folder_elem.append(container_elem)
            for(child_file of parent_to_children[file_hash]) {
                let child_elem = make_file_element(child_file)
                container_elem.append(child_elem)
            }
        }
        return folder_elem
    }
    else {
        return $(`<div class='file'  id="${file_hash}_div">
            <span class="oi oi-file" id="${file_hash}_icon"/> ${file_obj.filename}
            <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
            </button>
        </div>`)
    }
}

for(let root_file of root_files) {
    let file_elem = make_file_element(root_file)
    $( "#filestructure" ).append( file_elem);    
}



// make folder hierarchy into an accordion structure
$('.folder').accordion({
    collapsible: true,
    heightStyle: 'content'
}) // TODO: start collapsed and check whether read permission exists before expanding?


// -- Connect File Structure lock buttons to the permission dialog --

// open permissions dialog when a permission button is clicked
$('.permbutton').click( function( e ) {
    // Set the path and open dialog:
    let path = e.currentTarget.getAttribute('path');
    perm_dialog.attr('filepath', path)
    perm_dialog.dialog('open')
    //open_permissions_dialog(path)

    // Deal with the fact that folders try to collapse/expand when you click on their permissions button:
    e.stopPropagation() // don't propagate button click to element underneath it (e.g. folder accordion)
    // Emit a click for logging purposes:
    emitter.dispatchEvent(new CustomEvent('userEvent', { detail: new ClickEntry(ActionEnum.CLICK, (e.clientX + window.pageXOffset), (e.clientY + window.pageYOffset), e.target.id,new Date().getTime()) }))
});


// ---- Assign unique ids to everything that doesn't have an ID ----
$('#html-loc').find('*').uniqueId() 