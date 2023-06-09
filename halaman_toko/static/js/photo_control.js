function photo_manager_component_instantiate(photo_component_identifier, company_id, csrf_token){

    const container_selector_element = ".photo-manager." + photo_component_identifier;
    var all_photo_manager_items = [];
    var is_currently_sending_ajax = false;
    var reorder_update_timeout = -1;  // -1 is an invalid timeout_id. But it's ok to clear a non-existing timeout_id
    var timeout_delay = 2000;  // in ms

    const busy_msg =  "Sorry, we're still working on the previous request.";
    var return_obj = {
        'update_content_from_existing_json': update_content_from_existing_json,
        'is_currently_sending_ajax': (value=null) => {
            if (value == null)
                return is_currently_sending_ajax;
            is_currently_sending_ajax = value;
        },
        'error_handler': (type, message) => {},
        'success_handler': (type, message) => {},
        'misc_handler': (type, message) => {},
        'busy_msg': busy_msg,
        'manager_items': () => all_photo_manager_items,
        'reorder_update_timeout': () => reorder_update_timeout,
    };

    window.debug__all_photo_manager_items = all_photo_manager_items;
    window.debug__csrf_token = csrf_token;

    function update_content(){
        if (is_currently_sending_ajax) {
            return_obj.error_handler('busy', null, busy_msg);
            return false;
        }
        return_obj.misc_handler("updating", "fetching the photos from the server");


        is_currently_sending_ajax = true;
        $.get('/halaman-toko/edit-photos?id=' + company_id + '&ajax_get_json', function (response){
            is_currently_sending_ajax = false;
            return_obj.success_handler("updating", response);
            update_content_from_existing_json(response);
        })
            .fail(function (response) {
                is_currently_sending_ajax = false;
                return_obj.error_handler("updating", response)
            });
    }
    update_content();

    function clear_content(){
        // clear existing items
        for (let i = 0; i < all_photo_manager_items.length; i++) {
            all_photo_manager_items[i].element.remove();
        }
        all_photo_manager_items.length = 0;
    }

    function update_content_from_existing_json(json_response, clear=true){
        if (clear)
            clear_content();

        const received_json = json_response;
        const container = $(container_selector_element)[0];

        for (let i = 0; i < received_json.length; i++) {
            var temp = new PhotoManagerItems(container,  received_json[i].id);
            temp.set_photo_src(received_json[i].url);
            all_photo_manager_items.push(temp);
        }
    }

    function square_euclidean_distance(x1, y1, x2=0, y2=0){
        const temp_x = x1 - x2;
        const temp_y = y1 - y2;
        return temp_x*temp_x + temp_y*temp_y;
    }

    function get_photos_order(){
        let ret = {};

        for (let i = 0; i < all_photo_manager_items.length; i++) {
            ret[all_photo_manager_items[i].photo_id] = all_photo_manager_items[i].element.index();
        }

        return ret;
    }

    function submit_current_order(){
        if (is_currently_sending_ajax) {
            return_obj.error_handler('busy', null,  busy_msg);
            return false;
        }
        return_obj.misc_handler("reordering", "saving current photos order to the server");

        let data = {
            'photo_order': JSON.stringify(get_photos_order()),
            'company_id': company_id,
            'csrfmiddlewaretoken': csrf_token
        };
        window.debug__data = data;

        is_currently_sending_ajax = true;
        $.post("/halaman-toko/photo-reorder", data, function (response) {
            is_currently_sending_ajax = false;
            return_obj.success_handler("reordering", response);
        }).fail(function (response) {
            is_currently_sending_ajax = false;
            return_obj.error_handler('reordering', response);
        });
        return true;
    }

    function schedule_for_submit(){
        if (reorder_update_timeout != null)
            clearTimeout(reorder_update_timeout);

        console.log("scheduled");
        function update_timeout_func(){
            console.log("timeout")
            if (is_currently_sending_ajax) {
                reorder_update_timeout = setTimeout(update_timeout_func, timeout_delay);
                return;
            }
            submit_current_order();
        }
        reorder_update_timeout = setTimeout(update_timeout_func, timeout_delay);
    }

    class PhotoManagerItems{
        constructor(jquery_parent_div, id, draggable=true) {
            this.parent = $(jquery_parent_div);
            var template = $("#photo-manager-items-template");
            this.element = template.clone()[0];
            this.element = this.element.content.cloneNode(true);
            this.element = $(this.element.querySelector("div"));

            this.draggable = draggable;
            this.element.prop('draggable', draggable);
            this.next_sibling_in_prev_state = null;

            this.parent.append(this.element.get(0));
            // this.element.draggable({cursor: "pointer"});
            this.photo_url = "";
            this.photo_id = id;

            if (draggable)
                this.initiate_events();
        }

        set_photo_src(src){
            this.photo_url = src;
            this.element.get(0).style.setProperty('--photo-manager-items-background-url', 'url("' + src + '")');
        }

        delete_from_server(){
            if (is_currently_sending_ajax) {
                return_obj.error_handler('busy', null, busy_msg);
                return false;
            }
            return_obj.misc_handler("deleting", "deleting selected photo from the server");

            var data =  {
                'photo_id': this.photo_id,
                'csrfmiddlewaretoken': csrf_token
            };

            is_currently_sending_ajax = true;
            $.post("/halaman-toko/delete-photo", data, function (response) {
                is_currently_sending_ajax = false;
                return_obj.success_handler("deleting", response);
                update_content_from_existing_json(response);
            })
                .fail(function (xhr, text_status, error_thrown) {
                    is_currently_sending_ajax = false;
                    return_obj.error_handler('deleting', xhr, text_status, error_thrown);
            });
        }

        initiate_events(){
            const photo_manager_item = this;
            const this_element = photo_manager_item.element.get(0);

            function item_on_drag_start(e) {
                // this is used to track it's previous location in case it's not dropped in the correct container
                photo_manager_item.next_sibling_in_prev_state = photo_manager_item.element.next();
                if (photo_manager_item.next_sibling_in_prev_state == null)
                    photo_manager_item.next_sibling_in_prev_state = "item_sudah_paling_kanan";
                photo_manager_item.element.addClass("dragging");

                DataTransfer.effectAllowed = "pointer";
            }

            var stop = false;


            function container_on_drag_over(e) {
                if (stop)
                    return;
                const dragged_element = $(".dragging")[0];

                // assume there is N distinct photo_manager_items. Then, for every drag_over events,
                // there will be N distinct function of container_on_drag_over() that will be called.
                // each of them has their own scope of 'dragged_element'. This is because for every new item,
                // we're adding a new event listener to the container just to handle this new item.
                if (dragged_element !== this_element) {
                    return;
                }
                const next_element_before_moved = photo_manager_item.element.next().get(0);

                e.preventDefault();
                // nearest_object = the nearest photo_manager_item EXCEPT ITSELF that's nearest to the current cursor position
                // AND the cursor must be in the north-west of the objects, and the object cannot be itself
                var nearest_object = all_photo_manager_items.reduce(
                    (nearest_item, current_item) => {
                        const curr_box = current_item.element.get(0).getBoundingClientRect();
                        const cursor_x = e.clientX;
                        const cursor_y = e.clientY;

                        // const anchor_x = curr_box.left + 5*curr_box.width/8;
                        const anchor_x = curr_box.left + curr_box.width/2;
                        const anchor_y = curr_box.top + curr_box.height;

                        // vector starting from the anchor point to the current mouse position
                        const vector_x = cursor_x - anchor_x;
                        const vector_y = cursor_y - anchor_y;
                        const vector_len_square = square_euclidean_distance(vector_x, vector_y);

                        if (
                            vector_len_square < nearest_item.distance_square
                            && vector_x < 0
                            && vector_y < 0  // harus di kuadran 2. Karena kita mau memanfaatkan insertBefore()
                        ){
                            return {
                                'distance_square': vector_len_square,
                                'object': current_item
                            }
                        }else if (nearest_item.distance_square == Number.POSITIVE_INFINITY && vector_y + 100 < 0){
                            return {
                                'distance_square': vector_len_square,
                                'object': current_item
                            }
                        }

                        return nearest_item;
                    }, {
                        // distance merupakan jarak antara letak cursor saat ini hingga ke tengah-tengah object.element
                        'distance_square': Number.POSITIVE_INFINITY,  'object': null
                    }
                );
                nearest_object = nearest_object['object'];
                const photo_manager = photo_manager_item.parent.get(0);

                if (nearest_object === null){  // jika kita drag dia ke paling kanan

                    // jika dia TIDAK di paling kanan
                    // (jika dia paling kanan, maka sebelum dipindahin pun tidak ada elemen setelahnya. sehingga null)
                    if (next_element_before_moved != null){
                        photo_manager.append(dragged_element);
                    }
                    return;
                }

                const nearest_element = nearest_object.element.get(0);
                if (nearest_element === dragged_element)
                    return;
                else if (nearest_element === next_element_before_moved)
                    // sebenernya gaada masalah logic kalau gaada kondisi ini. Tapi bakal ada animasi/efek yg
                    // tidak diinginkan karena insertBefore()
                    return;


                const next_sibling_candidate = nearest_object.element.get(0);
                photo_manager.insertBefore(dragged_element, next_sibling_candidate);
            }

            function container_ondrop(e) {
                const dragged_element = $(".dragging")[0];
                if (dragged_element !== this_element) {
                    return;
                }

                schedule_for_submit();
                photo_manager_item.next_sibling_in_prev_state = null;
            }

            function item_on_drag_end(e) {
                photo_manager_item.element.removeClass("dragging");

                if (photo_manager_item.next_sibling_in_prev_state !== null){
                    // container belum memanggil ondrop(), sehingga pastilah photo_manager_item di-drop
                    // pada elemen lain selain container  [untuk container = sang photo_manager]

                    if (photo_manager_item.next_sibling_in_prev_state === "item_sudah_paling_kanan"){
                        photo_manager_item.parent.get(0).append(this_element);
                    }else{
                        photo_manager_item.parent[0].insertBefore(this_element,
                            photo_manager_item.next_sibling_in_prev_state.get(0));
                    }
                }
            }


            var touch_started = false;
            function container_on_touch_start(e){
                // console.log('container touch start');
                e.preventDefault();
                touch_started = true;
                item_on_drag_start(e);
            }

            function container_on_touch_move(e){
                if (touch_started) {
                    e.preventDefault();
                    var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
                    var imitate_event = {
                        'preventDefault': function (){},
                        'clientX': touch.pageX,
                        'clientY': touch.pageY
                    }

                    // console.log("touch move", touch.pageX, touch.pageY);
                    container_on_drag_over(imitate_event);
                }
            }


            function container_on_touch_cancel(e){
                if (touch_started) {
                    e.preventDefault();
                    touch_started = false;
                    container_on_touch_end(e);
                }
            }

            function container_on_touch_end(e){
                // console.log('container touch end');
                touch_started = false;
                e.preventDefault();
                container_ondrop(e);
                item_on_drag_end(e);
            }

            this.element.on('dragstart', item_on_drag_start);
            this.element.on('dragend', item_on_drag_end);
            this.parent.on('drop', container_ondrop);
            this.parent.on('dragover', container_on_drag_over);

            this.element.on('touchstart', container_on_touch_start);
            this.parent.on('touchmove', container_on_touch_move);
            this.parent.on('touchcancel', container_on_touch_cancel);
            this.parent.on('touchend', container_on_touch_end);

            var delete_btn = this.element.find(".delete-button");
            delete_btn.on("dblclick", () => this.delete_from_server());

            var touch_end_time = 0;
            delete_btn.on('touchend', (e) => {
                console.log('delete button touch end');
                if (touch_end_time !== 0 && ((new Date().getTime()) - touch_end_time) < 800){
                    console.log('delete button dblclicked');

                    var event = new MouseEvent('dblclick', {
                        'view': window,
                        'bubbles': true,
                        'cancelable': true
                    });
                    delete_btn[0].dispatchEvent(event);
                    touch_end_time = 0;
                } else {
                    touch_end_time =  new Date().getTime();
                }
            });

        }
    }


    return return_obj;
}

$(function () {
    $("[rel='tooltip']").tooltip();
});