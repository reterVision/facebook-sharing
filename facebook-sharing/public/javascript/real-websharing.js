/**
 * Created by: gaochao
 * Date: 12-3-25
 * Time: 2:09 PM
 * To change this template use File | Settings | File Templates.
*/

$(document).ready(function(){

    // Initialize resource type.
    resource_type = "status";
    is_resource_returned = false;

    function resetShowHide() {

        $('#add_resource_field').removeAttr("disabled");
        $('#real_clear_input').hide();
        $('#submit_resource').hide();
        $('#search_resource').show();
        hideError();
        is_resource_returned = false;
    }

    function hideError() {

        $('#search_format_error').hide();
        $('#search_connection_error').hide();
        $('#search_book_error').hide();
    }

    // Set resource type.
    $('#real_share_resource_status').bind("click", function(e) {

        resource_type = "status";

        $('#submit_resource').show();
        $('#search_resource').hide();
        hideError();
    });

    $('#real_share_resource_link').bind("click", function(e) {

        resource_type = "link";
        resetShowHide();
    });

    $('#real_share_resource_video').bind("click", function(e) {

        resource_type = "video";
        resetShowHide();
    });

    $('#real_share_resource_book').bind("click", function(e) {

        resource_type = "book";
        resetShowHide();
    });

    $('#search_resource').bind("click", function(e) {

        parse_link();
        if(is_resource_returned) {
            $('#search_resource').hide();
            $('#submit_resource').show();
        }

        return false;
    });

    // Clear input.
    $('#real_clear_input').bind("click", clear_input);
    function clear_input()
    {
        if(is_resource_returned) {

            resetShowHide();
        }

        return false;
    }

    // Get website information.
    $('#add_resource_field').bind("paste", parse_link);
    function parse_link ()
    {
        hideError();

        // Not necessary for status to search web.
        if(resource_type == "status") {
            return;
        }

        if(resource_type == "book") {
            setTimeout(function() {
                $('#submit_resource').attr("disabled", "disabled");
                $('#search_resource').attr("disabled", "disabled");

                $('#atc_loading').show();
                $.ajax({
                    type: "GET",
                    url: '/search_book?'+'book='+$('#add_resource_field').val(),
                    dataType: "json",
                    processData: false,
                    contentType: "json",
                    timeout: 30000,
                    success: function(response){

                        //Set Content
                        var book_title_array = new Array();
                        var book_desc_array = new Array();
                        var book_link_array = new Array();

                        $.each(response.title, function(a, b){

                            book_title_array.push(b);
                        });
                        $.each(response.description, function(a, b){

                            book_desc_array.push(b);
                        });
                        $.each(response.book_link, function(a, b){

                            book_link_array.push(b);
                        });

                        $('#atc_title').html(book_title_array[0]);
                        $('#atc_desc').html(book_desc_array[0]);
                        $('#atc_url').html("Book link");
                        $('#atc_url').attr("href", book_link_array[0]);

                        $('#atc_total_images').html(response.total_images);

                        $('#atc_images').html(' ');
                        $.each(response.images, function (a, b)
                        {
                            $('#atc_images').append('<img src="'+b+'" width="100" id="'+(a+1)+'">');
                        });
                        $('#atc_images img').hide();

                        //Flip Viewable Content
                        $('#attach_content').fadeIn('slow');
                        $('#atc_loading').hide();

                        //Show first image
                        $('img#1').fadeIn();
                        $('#cur_image').val(1);
                        $('#cur_image_num').html(1);

                        // next image
                        $('#next').unbind('click');
                        $('#next').bind("click", function(){

                            var total_images = parseInt($('#atc_total_images').html());
                            if (total_images > 0)
                            {
                                var index = $('#cur_image').val();
                                $('img#'+index).hide();
                                if(index < total_images)
                                {
                                    new_index = parseInt(index)+parseInt(1);
                                }
                                else
                                {
                                    new_index = 1;
                                }

                                $('#cur_image').val(new_index);
                                $('#cur_image_num').html(new_index);
                                $('img#'+new_index).show();

                                $('#atc_title').html(book_title_array[index]);
                                $('#atc_desc').html(book_desc_array[index]);
                                $('#atc_url').html("Book link");
                                $('#atc_url').attr("href", book_link_array[index]);
                            }
                        });

                        // prev image
                        $('#prev').unbind('click');
                        $('#prev').bind("click", function(){

                            var total_images = parseInt($('#atc_total_images').html());
                            if (total_images > 0)
                            {
                                var index = $('#cur_image').val();
                                $('img#'+index).hide();
                                if(index > 1)
                                {
                                    new_index = parseInt(index)-parseInt(1);;
                                }
                                else
                                {
                                    new_index = total_images;
                                }

                                $('#cur_image').val(new_index);
                                $('#cur_image_num').html(new_index);
                                $('img#'+new_index).show();

                                $('#atc_title').html(book_title_array[index]);
                                $('#atc_desc').html(book_desc_array[index]);
                                $('#atc_url').html("Book link");
                                $('#atc_url').attr("href", book_link_array[index]);
                            }
                        });

                        is_resource_returned = true;
                        $('#real_clear_input').show();

                        $('#add_resource_field').attr("disabled", "disabled");
                        $('#submit_resource').removeAttr("disabled");
                        $('#search_resource').removeAttr("disabled");

                        $('#submit_resource').show();
                        $('#search_resource').hide();
                    },
                    error: function(xhr, textStatus, errorThrown){
                        $('#atc_loading').hide();
                        $('#submit_resource').removeAttr("disabled");
                        $('#search_resource').removeAttr("disabled");
                        $('#search_book_error').show();
                    }
                });
            }, 0);
        }
        else {
            setTimeout(function() {
                if(!isValidURL($('#add_resource_field').val()))
                {
                    $('#search_format_error').show();
                    return false;
                }
                else
                {
                    $('#submit_resource').attr("disabled", "disabled");
                    $('#search_resource').attr("disabled", "disabled");

                    $('#atc_loading').show();
                    $('#atc_url').html($('#add_resource_field').val().substring(0, 50)+"...");
                    $.ajax({
                        type: "GET",
                        url: '/search_url?'+'url='+$('#add_resource_field').val(),
                        dataType: "json",
                        processData: false,
                        contentType: "json",
                        success: function(response){
                            //Set Content
                            $('#atc_title').html(response.title);
                            $('#atc_desc').html(response.description);
                            $('#atc_url').attr("href", $('#add_resource_field').val());

                            $('#atc_total_images').html(response.total_images);

                            $('#atc_images').html(' ');
                            $.each(response.images, function (a, b)
                            {
                                $('#atc_images').append('<img src="'+b+'" width="100" id="'+(a+1)+'">');
                            });
                            $('#atc_images img').hide();

                            //Flip Viewable Content
                            $('#attach_content').fadeIn('slow');
                            $('#atc_loading').hide();

                            //Show first image
                            $('img#1').fadeIn();
                            $('#cur_image').val(1);
                            $('#cur_image_num').html(1);

                            // next image
                            $('#next').unbind('click');
                            $('#next').bind("click", function(){

                                var total_images = parseInt($('#atc_total_images').html());
                                if (total_images > 0)
                                {
                                    var index = $('#cur_image').val();
                                    $('img#'+index).hide();
                                    if(index < total_images)
                                    {
                                        new_index = parseInt(index)+parseInt(1);
                                    }
                                    else
                                    {
                                        new_index = 1;
                                    }

                                    $('#cur_image').val(new_index);
                                    $('#cur_image_num').html(new_index);
                                    $('img#'+new_index).show();
                                }
                            });

                            // prev image
                            $('#prev').unbind('click');
                            $('#prev').bind("click", function(){

                                var total_images = parseInt($('#atc_total_images').html());
                                if (total_images > 0)
                                {
                                    var index = $('#cur_image').val();
                                    $('img#'+index).hide();
                                    if(index > 1)
                                    {
                                        new_index = parseInt(index)-parseInt(1);;
                                    }
                                    else
                                    {
                                        new_index = total_images;
                                    }

                                    $('#cur_image').val(new_index);
                                    $('#cur_image_num').html(new_index);
                                    $('img#'+new_index).show();
                                }
                            });

                            is_resource_returned = true;
                            $('#real_clear_input').show();

                            $('#add_resource_field').attr("disabled", "disabled");
                            $('#submit_resource').removeAttr("disabled");
                            $('#search_resource').removeAttr("disabled");

                            $('#submit_resource').show();
                            $('#search_resource').hide();
                        },
                        error: function(xhr, textStatus, errorThrown){
                            $('#atc_loading').hide();
                            $('#submit_resource').removeAttr("disabled");
                            $('#search_resource').removeAttr("disabled");
                            $('#search_connection_error').show();
                        }
                    });
                }
            }, 0);
        }
    }
});

function isValidURL(url)
{
    var RegExpHeader = /(ftp|http|https):\/\/.*/;
    if(!RegExpHeader.test(url)) {
        url = "http://" + url;
        $('#add_resource_field').val(url);
    }

    var RegExp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

    if(RegExp.test(url)){
        return true;
    }else{
        return false;
    }
}

function checkKeyword(){

    var select_box = document.getElementById ("select_box");

    if (resource_type == "status"){
        $('#resource_url_title').val($('#add_resource_field').val());
    }
    else {
        $('#resource_url_title').val($('#atc_title').html());
    }

    if (resource_type != "status") {
        $('#resource_description').val($('#atc_desc').html());

        var index = $('#cur_image').val();
        $('#resource_image_uri').val($('#atc_images').find('img').get(index-1).src);
        $('#resource_uri').val($('#atc_url').attr("href"));
    }

    $('#resource_type_id').val(resource_type);

    if (select_box.length==0) {
        return false;
    }else{
        return true;
    }
}

function checkKeyword_Resource() {

    if (resource_type == "status") {
        $('#resource_url_title').val($('#add_resource_field').val());
    }
    else {
        $('#resource_url_title').val($('#atc_title').html());
    }

    if (resource_type != "status") {
        $('#resource_description').val($('#atc_desc').html());

        var index = $('#cur_image').val();
        $('#resource_image_uri').val($('#atc_images').find('img').get(index-1).src);
        $('#resource_uri').val($('#atc_url').attr("href"));
    }

    $('#resource_type_id').val(resource_type);

    return true;
}
