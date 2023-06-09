var modal_event_control;

$(document).ready(function (){

    $(function() {
        $('#company_photos_carousel').each(function(){
            $(this).carousel({
                interval: 7000
            });
        });
    });

    function carousel_background_updates(update_only_if_active=true) {
        /*
        mengupdate background pada carousel supaya mengikuti foto utama, tetapi sedikit lebih blur,
        sekaligus merubah warna pada carousel indicator supaya kontras terhadap foto.

        Jika update_only_if_active == true, maka yang diupdate hanyalah slide carousel yang sedang aktif saat ini.
        Jika update_only_if_active == false, maka yang diupdate adalah semua slide [biasanya dipanggil saat pertama kali load].
        Jika update_only_if_active == false, maka untuk yang terakhir kalinya kita harus memanggil ulang:
            carousel_background_updates(true)
            sebab, jika tidak, maka warna background pada carousel indicator akan kontras terhadap foto yang terakhir.
            Padahal harusnya dia kontras terhadap foto pada current main slide. Oleh karena itu main slide
            harus diupdate sekali lagi jika awalnya kita memanggil update_only_if_active == false
         */

        var carousel_item, background_el;
        if (update_only_if_active) {
            carousel_item = $('#company_photos_carousel .carousel-item.active .company_photos_carousel_item_img');
            background_el = $("#company_photos_carousel .carousel-item.active .carousel-item-extra-background");
        }else {
            carousel_item = $('#company_photos_carousel .carousel-item .company_photos_carousel_item_img');
            background_el = $("#company_photos_carousel .carousel-item .carousel-item-extra-background");
        }

        for (let i = 0; i < carousel_item.length; i++) {
            var temp2 = getComputedStyle(carousel_item.get(i)).getPropertyValue("--company_photos_carousel_background_img");
            $(".carousel-adaptive-background-component").css("background-image", temp2);
            background_el.eq(i).css("background-image", temp2);
        }

        if (!update_only_if_active)
            carousel_background_updates(true);
    }

    $('#company_photos_carousel').on('slid.bs.carousel', carousel_background_updates)
    carousel_background_updates(false);



    $("#edit_btn").on('click', function(e){
        $("#control_btn_container").toggleClass("editing_mode");
        $("#company_description").attr('contenteditable','true');
        window.onbeforeunload = function(){
            return 'Perubahan pada deskripsi belum disimpan. Apakah Anda benar-benar ingin meninggalkan laman ini?';
        };
    });



    $("#save_btn").on('click', function(e){
        var el =  $("#company_description");
        var description_content = get_text_with_correct_new_lines(el);

        if (description_content.length === 0){
            alert("sorry, the description cannot be empty");
            return;
        }

        el.html(get_text_with_correct_new_lines(el, false));
        $("#company_description").attr('contenteditable','false');
        $(".control_btn").prop('disabled', true);


        $.ajax("/halaman-toko/save-edited-company-form", {
            type: "POST",
            data: {
                'id': company_id,
                'deskripsi': description_content,
                'csrfmiddlewaretoken': csrf_token,
            }, success: function () {
                window.onbeforeunload = null;
                $("#control_btn_container").toggleClass("editing_mode");
                $(".control_btn").prop('disabled', false);
                show_toast("The description has been saved successfully!", 2)
            }, error: function (xhr){
                $("#company_description").attr('contenteditable','true');
                $(".control_btn").prop('disabled', false);

                if (xhr.readyState === 0)  // masalah koneksi
                    show_toast("Sorry, we encountered a connection problem", 1);
                else if (xhr.readyState === 4)  // status code error
                    show_toast(xhr.statusText + ":  " + xhr.responseText, 1);
                else
                    show_toast("Sorry, we encountered an unknown error", 1);
            }
        });
    });

    $(".choose_proposal_btn").on("click", (e) => {
        var temp = $("#pick-proposal");
        temp[0].value = null;  // mermperbolehkan user untuk mengupload ulang (mengupdate) bahkan jika nama filenya sama
        temp[0].click()
    });

    $("#pick-proposal:file").change(function (e) {
        console.log("asd", $("#pick-proposal:file")[0].files.length)
        if ($("#pick-proposal:file")[0].files.length > 0){
            show_toast('uploading...', 0);
            var formData = new FormData($("form#upload-proposal-form").get(0));

            $.ajax({  // harus pakai ajax `processData: false, contentType: false` untuk mencegah illegal invocation
                url: "/halaman-toko/upload-proposal",
                type: 'POST',
                data: formData,
                success: function (response) {
                    show_toast("success!", 2);
                    $("#download-proposal").prop('href', response);
                    $("#download-proposal").prop('target', "_blank");
                },
                error: function(xhr, text_status, error_thrown){
                    if (xhr.readyState === 0)  // masalah koneksi
                        show_toast("Sorry, we encountered a connection problem", 1);
                    else if (xhr.readyState === 4)  // status code error
                        show_toast(xhr.statusText + ":  " + xhr.responseText, 1);
                    else
                        show_toast("Sorry, we encountered an unknown error", 1);
                },

                processData: false,
                contentType: false,
                cache: false,
            });
        }
    });

    $(".request_for_verification").on('click', function (e) {
        show_modal("Apakah Anda benar-benar ingin mengajukan verifikasi? " + "<br/><br/>" +
            "Jika anda sudah mengajukan verifikasi, maka anda tidak akan bisa mengubah informasi " +
            "apapun lagi untuk kedepannya",

            "Submit for verification",
            function (e) {
                show_toast('submitting the verification', 0);
                var proposal = $("form#request-verification-form");

                $.ajax({  // harus pakai ajax `processData: false, contentType: false` untuk mencegah illegal invocation
                    url: proposal.prop('action'),
                    type: 'POST',
                    data: new FormData(proposal.get(0)),
                    success: function (response) {
                        show_toast("success!", 2);
                        setTimeout(()=>location.reload(), 2000);
                    },
                    error: function(xhr, text_status, error_thrown){
                        if (xhr.readyState === 0)  // masalah koneksi
                            show_toast("Sorry, we encountered a connection problem", 1);
                        else if (xhr.readyState === 4)  // status code error
                            show_toast(xhr.statusText + ":  " + xhr.responseText, 1);
                        else
                            show_toast("Sorry, we encountered an unknown error", 1);
                    },

                    processData: false,
                    contentType: false,
                    cache: false,
                });

                return true;  // close the modal
            }, function (e) {
                show_toast("the submission for verification has been cancelled", 0);
                return true;  // close the modal
            });
    })



    $('.toast').toast({delay:4000});

    $(function () {
        $("[rel='tooltip']").tooltip();
    });

    modal_event_control = initiate_modal_event_control();
});


function company_description_KeyPress(){
    var el =  $("#company_description");
    var description_content = get_text_with_correct_new_lines(el, false);
    description_content
    el.html(description_content);
}

function get_text_with_correct_new_lines(element, decode_tag=true){
    const convertToText = (str = '') => {  // credit: https://gist.github.com/nathansmith/86b5d4b23ed968a92fd4
        // Ensure string.
        let value = String(str);

        // Convert encoding.
        value = value.replace(/&nbsp;/gi, ' ');
        value = value.replace(/&amp;/gi, '&');

        // Replace `<br>`.
        value = value.replace(/<br>/gi, '\n');

        // Replace `<div>` (from Chrome).
        value = value.replace(/<div>/gi, '\n');

        // Replace `<p>` (from IE).
        value = value.replace(/<p>/gi, '\n');

        // Remove extra tags.
        value = value.replace(/<(.*?)>/g, '');

        // Trim each line.
        value = value
            .split('\n')
            .map((line = '') => {
                return line.trim();
            })
            .join('\n');

        // No more than 2x newline, per "paragraph".
        value = value.replace(/\n\n+/g, '\n\n');

        // Clean up spaces.
        value = value.replace(/[ ]+/g, ' ');
        value = value.trim();


        // decode
        value = value.replace(/&amp;/gi, '&');
        if (decode_tag) {
            value = value.replace(/&gt;/gi, '>');
            value = value.replace(/&lt;/gi, '<');
        }

        // Expose string.
        return value;
    };
    return convertToText(element.html());
}




function show_modal(message, title="", on_ok=(e)=>true, on_cancel = (e)=>true){
    var modal = $("#my-modal-box");
    modal.find(".modal-title").html(title);
    modal.find(".modal-body").html(message);

    modal_event_control.set_on_ok(on_ok);
    modal_event_control.set_on_cancel(on_cancel);
    modal.modal('show');
}


function initiate_modal_event_control(){
    var on_ok = (e) => {};
    var on_cancel = (e) => {};

    function set_on_ok(func) {
        on_ok = func;
    }

    function set_on_cancel(func) {
        on_cancel = func;
    }

    function get_on_ok(){
        return on_ok;
    }

    function get_on_cancel(){
        return on_cancel;
    }

    var modal = $("#my-modal-box");
    var cancel_btn = modal.find(".cancel-btn");
    var ok_btn = modal.find(".ok-btn");

    cancel_btn.on('click', function (e) {
        if (get_on_cancel()(e))
            modal.modal('hide');
    })
    ok_btn.on('click', function (e) {
        if (get_on_ok()(e))
            modal.modal('hide');
    })

    return {
        'set_on_ok': set_on_ok,
        'set_on_cancel': set_on_cancel,
        'get_on_ok': get_on_ok,
        'get_on_cancel': get_on_cancel,
    }
}

