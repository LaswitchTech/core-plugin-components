builder.add('components','timeline', class extends builder.ComponentClass {

    _init(){
        this._properties = {
            class: {
                timeline: null,
                item: null,
                icon: null,
                object: null,
                filters: null,
                component: null,
            },
            order: 'DESC',
            showNow: true,
            showStart: true,
            properties: {
                icon: 'circle',
                color: 'secondary',
                type: '',
                datetime: null,
                order: null,
                label: true,
                id:null,
                class: {
                    item: null,
                    icon: null,
                    object: null,
                },
            },
        };
    }

    _create(){

        // Set Self
        const self = this;

        // Create Component
        this._component = $(document.createElement('div')).attr({
            'id': 'timeline' + this._id,
        });
        this._component.id = this._component.attr('id');

        // Create Filters
        this._component.filters = $(document.createElement('div')).attr({
            'id': this._component.id + 'filters',
            'class': 'btn-group',
            'role': 'group',
            'aria-label': 'Filters',
            'data-filters': '',
        }).appendTo(this._component);

        // Add Filter 'All'
        this._component.filters.all = $(document.createElement('button')).attr({
            'class': 'btn btn-primary text-capitalize',
            'type': 'button',
            'data-type': null,
            'data-label': 'All',
        }).html('All').appendTo(this._component.filters);
        this._component.filters.all.click(function(){
            self._component.filters.attr('data-filters','');
            self.filter();
        });

        // Create Timeline
        this._component.timeline = $(document.createElement('div')).addClass('timeline').appendTo(this._component);

        // Set Component Class
        if(this._properties.class.component){
            this._component.addClass(this._properties.class.component);
        }

        // Set Filters Class
        if(this._properties.class.filters){
            this._component.filters.addClass(this._properties.class.filters);
        }

        // Set Timeline Class
        if(this._properties.class.timeline){
            this._component.timeline.addClass(this._properties.class.timeline);
        }

        // Clear Timeline
        this.clear();

        // Add Search to Timeline
        this._builder.Search.add(this._component.timeline);
    }

    clear(){

        // Set Self
        const self = this;

        // Remove Children
        this._component.timeline.children().remove();

        // Show Start
        if(this._properties.showStart){
            this.add({order:'0000000000000',icon:'clock-history',label: false},function(object){
                object.item.remove();
                object.removeAttr('data-search').removeAttr('data-type');
            });
        }

        // Show Now
        if(this._properties.showNow){
            this.add({order:'9999999999999',color:'success',icon:'clock',label: false},function(object){
                object.item.remove();
                object.removeAttr('data-search').removeAttr('data-type');
            });
        }

        // Return Object
        return this;
    }

    sort(order = null){

        // Set Order
        if(order == null){
            order = this._properties.order;
        }

        // Sanitize Order
        if(order != 'ASC' && order != 'DESC'){
            order = 'DESC';
        }

        // Retrieve Objects
        let objects = this._component.timeline.children('div').detach().get();

        // Sort Objects
        objects.sort(function(a, b){
            if(order == 'ASC'){
                return new Date($(a).data('order')) - new Date($(b).data('order'));
            } else {
                return new Date($(b).data('order')) - new Date($(a).data('order'));
            }
        });

        // Append Objects
        this._component.timeline.append(objects)

        // Return Object
        return this;
    }

    filter(){
        this._component.filters.find('button').removeClass('btn-primary').addClass('btn-light');
        let current = this._component.filters.attr('data-filters').split(',');
        if(this._component.filters.attr('data-filters') != ''){
            this._component.timeline.find('[data-type]').hide();
            for(const [key, filter] of Object.entries(current)){
                this._component.filters.find('button[data-type="' + filter + '"]').addClass('btn-primary').removeClass('btn-light');
                this._component.timeline.find('[data-type="' + filter + '"]').show();
            }
        } else {
            this._component.timeline.find('[data-type]').show();
            this._component.filters.find('button[data-label="All"]').addClass('btn-primary').removeClass('btn-light');
        }
    }

    addFilter(type = '', string = null){

        // Set Self
        const self = this;

        // Set Label
        var label = string;
        if(label == null && type != ''){
            label = type;
        }

        // Check if Filter Exists
        if(label != null && this._component.filters.children('[data-label="' + label + '"]').length <= 0){

            // Create Filter
            var filter = $(document.createElement('button')).attr({
                'class': 'btn btn-light text-capitalize',
                'type': 'button',
                'data-type': type,
                'data-label': label,
            }).html(self._builder.Locale.get(label)).appendTo(this._component.filters);

            // Add Filter Event
            filter.click(function(){

                // Get Current Filters
                var current = self._component.filters.attr('data-filters').split(',')
                if(self._builder.Helper.inArray(type,current)){
                    current = current.filter(function(value){
                        return value != type;
                    });
                } else {
                    current.push(type);
                }
                let filterString = current.toString();
                if(filterString.charAt(0) == ','){
                    filterString = filterString.substring(1);
                }
                self._component.filters.attr('data-filters',filterString);
                self.filter();
            });
        }
    }

    label(timestamp, color = 'primary'){

        // Sanitize Timestamp
        let datetime = new Date(timestamp);

        // Set Order
        let order = datetime.setHours(0,0,0,0);

        // Check if Label Exists
        if(this._component.timeline.find('div.time-label[data-order="'+order+'"]').length > 0){

            // Return Object
            return this;
        }

        // Create Label
        var label = $(document.createElement('div')).attr({
            'class': 'time-label',
            'data-order': order,
        }).addClass('time-label').attr('data-order',order).prependTo(this._component.timeline);
        label.time = $(document.createElement('span')).attr({
            'class': 'text-bg-'+color,
            'title': datetime.toLocaleString('en-US'),
            'data-bs-toggle': 'tooltip',
            'data-bs-placement': 'right',
        }).html(datetime.toLocaleDateString('en-US',{day: 'numeric', month: 'long', year: 'numeric'})).appendTo(label);

        // Return Object
        return this;
    }

    add(options = {}, callback = null){

        // Check if options is a Function
        if(options instanceof Function){ callback = options; options = {}; }

        // Create Properties Options
        let properties = {};
        for(const [key, value] of Object.entries(this._properties.properties)){
            if(typeof properties[key] === 'undefined'){
                switch(key){
                    case"datetime":
                        properties[key] = Date.parse(new Date());
                        break;
                    case"class":
                        properties[key] = {};
                        for(const [section, classes] of Object.entries(value)){
                            if(properties[key][section] != null){
                                properties[key][section] += ' ' + classes;
                            } else {
                                properties[key][section] = classes;
                            }
                        }
                        break;
                    default:
                        properties[key] = value;
                        break;
                }
            }
        }

        // Set Options
        for(const [key, value] of Object.entries(options)){
            if(typeof properties[key] !== 'undefined'){
                switch(key){
                    case"class":
                        for(const [section, classes] of Object.entries(value)){
                            if(properties[key][section] != null){
                                properties[key][section] += ' ' + classes;
                            } else {
                                properties[key][section] = classes;
                            }
                        }
                        break;
                    default:
                        properties[key] = value;
                        break;
                }
            }
        }

        // Set ID
        let id = this._count();

        // Create Timeline
        var object = $(document.createElement('div')).attr({
            'id': this._component.id + 'object' + id,
            'class': 'timeline-object',
        }).appendTo(this._component.timeline);
        object.id = object.attr('id');

        // Set Properties
        object.properties = properties;

        // Set object Class
        if(this._properties.class.object){
            object.addClass(this._properties.class.object);
        }
        if(properties.class.object){
            object.addClass(properties.class.object);
        }

        // Set DateTime
        if(properties.datetime == null){
            properties.datetime = new Date();
        }
        var datetime = new Date(properties.datetime);

        // Set Order
        var order = Date.parse(datetime);
        if(properties.order != null){
            order = properties.order;
        }
        object.attr('data-order',order);

        // Set Type
        if(properties.type != null){
            object.attr('data-type',properties.type);
        }

        // Add Filter
        if(properties.type != null){
            this.addFilter(properties.type);
        }

        // Set Icon
        object.icon = $(document.createElement('i')).addClass('bi bi-' + properties.icon + ' text-bg-'+properties.color).appendTo(object);
        if(properties.class.icon){
            object.icon.addClass(properties.class.icon);
        }

        // Set item
        object.item = $(document.createElement('div')).addClass('timeline-item').appendTo(object);
        if(this._properties.class.item){
            object.item.addClass(this._properties.class.item);
        }
        if(properties.class.item){
            object.item.addClass(properties.class.item);
        }

        // Set Tools
        object.tools = $(document.createElement('div')).addClass('tools').appendTo(object.item);

        // Set Time
        var time = $(document.createElement('span')).appendTo(object.tools);
        time.icon = $(document.createElement('i')).addClass('bi bi-clock me-1').appendTo(time);
        time.ago = $(document.createElement('time')).attr({
            'class': 'timeago',
            'title': datetime.toLocaleString(),
            'datetime': datetime.toLocaleString(),
            'data-bs-toggle': 'tooltip',
            'data-bs-placement': 'top',
            'data-bs-title': datetime.toLocaleString(),
        }).appendTo(time);
        time.ago.timeago();
        time.ago.bootstrap = new bootstrap.Tooltip(time.ago);
        object.time = time;

        // Add Label
        if(properties.label){
            this.label(order)
        }

        // Execute Callback
        if(typeof callback === 'function'){
            callback(object,this);
        }

        // Sort
        this.sort();

        // Set Search
        this._builder.Search.set(object);

        // Return Object
        return this;
    }
});
builder.add('components','ribbon', class extends builder.ComponentClass {

    _init(){
        this._properties = {
            class: {
                component: null,
                wrapper: null,
                ribbon: null,
            },
            color: null,
            label: null,
            icon: null,
            size: null,
        };
    }

    _create(){

        // Set Self
        const self = this;

        // Create Component
        this._component = $(document.createElement('div')).attr({
            'id': 'ribbon' + this._id,
            'class': 'ribbon-wrapper',
        });
        this._component.id = this._component.attr('id');

        // Create Ribbon
        this._component.ribbon = $(document.createElement('div')).addClass('ribbon').appendTo(this._component);
        this._component.ribbon.icon = $(document.createElement('i')).addClass('me-1 bi bi-' + this._properties.icon).appendTo(this._component.ribbon);
        this._component.ribbon.label = $(document.createElement('span')).appendTo(this._component.ribbon);

        // Set Component Class
        if(this._properties.class.component){
            this._component.addClass(this._properties.class.component);
        }

        // Set Wrapper Class
        if(this._properties.class.wrapper){
            this._component.addClass(this._properties.class.wrapper);
        }

        // Set Ribbon Class
        if(this._properties.class.ribbon){
            this._component.ribbon.addClass(this._properties.class.ribbon);
        }

        // Set Color
        if(this._properties.color){
            this._component.ribbon.addClass('text-bg-' + this._properties.color);
        }

        // Set Label
        if(this._properties.label){
            this._component.ribbon.label.html(this._properties.label);
        }

        // Set Icon
        if(this._properties.icon == null){
            this._component.ribbon.icon.remove();
        }

        // Set Size
        if(this._properties.size){
            switch(this._properties.size){
                case"lg":
                    this._component.addClass('ribbon-lg');
                    break;
                case"xl":
                    this._component.addClass('ribbon-xl');
                    break;
                default:
                    break;
            }
        }
    }
});
builder.add('components','info', class extends builder.ComponentClass {

    _init(){
        this._properties = {
            class: {
                component: null,
                info: null,
                icon: null,
                content: null,
                link: null,
            },
            icon: 'circle',
            color: 'primary',
            link: null,
        };
    }

    _create(){

        // Set Self
        const self = this;

        // Create Component
        this._component = $(document.createElement('div')).attr({
            'id': 'info' + this._id,
            'class': 'card text-bg-' + this._properties.color,
        });
        this._component.id = this._component.attr('id');

        // Create Row
        this._component.row = $(document.createElement('div')).addClass('d-flex justify-content-between align-items-stretch px-2').appendTo(this._component);

        // Create Link
        this._component.link = $(document.createElement('a')).attr('href',this._properties.link).addClass('text-center text-bg-black-25 w-100 p-1').appendTo(this._component);
        this._component.link.text = $(document.createElement('span')).text('More Info').appendTo(this._component.link);
        this._component.link.icon = $(document.createElement('i')).addClass('ms-1 bi bi-arrow-right-circle').appendTo(this._component.link.text);

        // Create Content
        this._component.content = $(document.createElement('div')).addClass('p-2').appendTo(this._component.row);

        // Create Icon Frame
        this._component.iconFrame = $(document.createElement('div')).appendTo(this._component.row);
        this._component.iconFrame.icon = $(document.createElement('i')).addClass('text-dark opacity-50 bi bi-' + this._properties.icon).css({"font-size":"5rem"}).appendTo(this._component.iconFrame);

        // Set Component Class
        if(this._properties.class.component){
            this._component.addClass(this._properties.class.component);
        }

        // Set Info Class
        if(this._properties.class.box){
            this._component.addClass(this._properties.class.box);
        }

        // Set Info Icon Frame Class
        if(this._properties.class.icon){
            this._component.iconFrame.addClass(this._properties.class.icon);
        }

        // Set Info Content Class
        if(this._properties.class.content){
            this._component.content.addClass(this._properties.class.content);
        }

        // Set Info Link Class
        if(this._properties.class.link){
            this._component.link.addClass(this._properties.class.link);
        }

        // Set Info Icon
        if(this._properties.icon == null){
            this._component.iconFrame.icon.remove();
        }

        // Set Info Link
        if(this._properties.link == null){
            this._component.link.remove();
        }
    }
});
builder.add('components','code', class extends builder.ComponentClass {

    _init(){
        this._properties = {
            class: {
                component: null,
            },
            language: null,
            title: null,
            code: null,
            clipboard: false,
            fullscreen: false,
            highlight: true,
            collapse: true,
            collapsed: false,
        };
    }

    _create(){

        // Set Self
        const self = this;

        // Create Component
        this._component = $(document.createElement('div')).attr({
            'id': 'code' + this._id,
            'class': 'card text-bg-dark',
            'style': 'transition: all 400ms ease',
        });
        this._component.id = this._component.attr('id');

        // Add Header
        this._component.header = $(document.createElement('div')).addClass('card-header user-select-none').appendTo(this._component);
        this._component.header.heading = $(document.createElement('h5')).addClass('card-title d-flex align-items-center my-2').appendTo(this._component.header);
        this._component.header.icon = $(document.createElement('i')).addClass('bi-code-slash me-2').appendTo(this._component.header.heading);
        this._component.header.language = $(document.createElement('samp')).addClass('mx-1 text-uppercase').appendTo(this._component.header.heading);
        this._component.header.title = $(document.createElement('small')).addClass('mx-1').appendTo(this._component.header.heading);

        // Add Controls
        this._component.controls = $(document.createElement('span')).addClass('ms-auto d-flex align-items-center').appendTo(this._component.header.heading);
        this._component.controls.collapse = $(document.createElement('a')).addClass('ms-3 text-decoration-none cursor-pointer').appendTo(this._component.controls);
        this._component.controls.collapse.icon = $(document.createElement('i')).addClass('bi-chevron-bar-contract').appendTo(this._component.controls.collapse);
        this._component.controls.clipboard = $(document.createElement('a')).addClass('ms-3 text-decoration-none cursor-pointer').appendTo(this._component.controls);
        this._component.controls.clipboard.icon = $(document.createElement('i')).addClass('bi-clipboard').appendTo(this._component.controls.clipboard);
        this._component.controls.fullscreen = $(document.createElement('a')).addClass('ms-3 text-decoration-none cursor-pointer').appendTo(this._component.controls);
        this._component.controls.fullscreen.icon = $(document.createElement('i')).addClass('bi-fullscreen').appendTo(this._component.controls.fullscreen);

        // Add Body Collapse
        this._component.collapse = $(document.createElement('div')).addClass('collapse show').attr('id',this._component.id + 'collapse').appendTo(this._component);
        this._component.collapse.id = this._component.collapse.attr('id');

        // Add Body
        this._component.body = $(document.createElement('div')).addClass('card-body p-0').appendTo(this._component.collapse);
        this._component.pre = $(document.createElement('pre')).addClass('m-0 p-3 h-100').appendTo(this._component.body);
        this._component.code = $(document.createElement('code')).addClass('language-*').css('transition','all 400ms ease').appendTo(this._component.pre);

        // Set Component Class
        if(this._properties.class.component){
            this._component.addClass(this._properties.class.component);
        }

        // Set Title
        if(this._properties.title){
            this._component.header.title.html(this._properties.title);
        }

        // Set Language
        if(this._properties.language){
            this._properties.language = this._properties.language.toString().toLowerCase();
            if(typeof Prism.languages[this._properties.language] !== 'undefined'){
                this._component.header.language.html(this._properties.language);
                this._component.code.addClass('language-' + this._properties.language);
            }
        }

        // Set Fullscreen
        if(this._properties.fullscreen){
            this._component.controls.fullscreen.click(function(){
                if(self._component.controls.fullscreen.icon.hasClass('bi-fullscreen')){
                    self._component.addClass('position-fixed top-0 start-0 w-100 h-100 rounded-0').css('z-index', 1050);
                    self._component.body.addClass('h-100 overflow-auto');
                    self._component.controls.fullscreen.icon.removeClass('bi-fullscreen').addClass('bi-fullscreen-exit');
                } else {
                    self._component.removeClass('position-fixed top-0 start-0 w-100 h-100 rounded-0').css('z-index', '');
                    self._component.body.removeClass('h-100 overflow-auto');
                    self._component.controls.fullscreen.icon.removeClass('bi-fullscreen-exit').addClass('bi-fullscreen');
                }
            })
        } else {
            this._component.controls.fullscreen.addClass('d-none');
        }

        // Set Clipboard
        if(this._properties.clipboard){
            this._component.controls.clipboard.click(function(){
                self._builder.Helper.copyToClipboard(self._component.code);
            })
        } else {
            this._component.controls.clipboard.addClass('d-none');
        }

        // Set Code
        if(this._properties.code){
            this._component.code.html(this._properties.code);
            if(this._properties.highlight && this._properties.language && typeof Prism.languages[this._properties.language] !== 'undefined'){
                this._component.code.html(Prism.highlight(this._component.code.html(),Prism.languages[this._properties.language]))
            }
        }

        // Set Collapse
        if(this._properties.collapse){
            this._component.collapse.bs = new bootstrap.Collapse(this._component.collapse,{toggle:false});
            this._component.controls.collapse.click(function(){
                if(self._component.controls.collapse.icon.hasClass('bi-chevron-bar-expand')){
                    self._component.collapse.bs.show();
                    self._component.controls.collapse.icon.removeClass('bi-chevron-bar-expand').addClass('bi-chevron-bar-contract');
                    self._component.header.removeClass('rounded border-0');
                } else {
                    self._component.collapse.bs.hide()
                    self._component.controls.collapse.icon.removeClass('bi-chevron-bar-contract').addClass('bi-chevron-bar-expand');
                    self._component.header.addClass('rounded border-0');
                }
            });
        } else {
            this._component.controls.collapse.addClass('d-none');
        }
        if(this._properties.collapsed){
            this._component.collapse.removeClass('show');
            this._component.controls.collapse.icon.removeClass('bi-chevron-bar-contract').addClass('bi-chevron-bar-expand');
            this._component.header.addClass('rounded border-0');
        }
    }
});

builder.add('layouts','index', class extends builder.ComponentClass {

    #interval = null;

    _init(){
        this._properties = {
            class: {
                component: null,
            },
            url: null,
            conditions: [],
            dblclick: null,
            actions: {},
            buttons: [],
            columns: [],
            standardSearch: true,
            selectTools: true,
            advancedSearch: true,
            showButtonsLabel: false,
            interval: 15000,
            autoStart: false,
            callback: {},
        };
        this._data = {};
    }

    config(options){

        // Set Self
        const self = this;

        // Execute parent config
        super.config(options);

        // Table Properties
        this._properties.table = {};
        this._properties.table.class = {};
        this._properties.table.datatable = {};

        // Table Properties
        this._properties.table.class.buttons = 'index-controls';
        this._properties.table.class.table = 'index-table';
        this._properties.table.class.footer = 'index-footer';
        this._properties.table.standardSearch = this._properties.standardSearch;
        this._properties.table.selectTools = this._properties.selectTools;
        this._properties.table.advancedSearch = this._properties.advancedSearch;
        this._properties.table.showButtonsLabel = this._properties.showButtonsLabel;

        // Responsive
        this._properties.table.datatable.responsive = {
            breakpoints: [
                { name: 'xl', width: Infinity },
                { name: 'lg', width: 1400 },
                { name: 'md', width: 992 },
                { name: 'sm', width: 768 },
                { name: 'xs', width: 576 },
                { name: 'xxs', width: 0 }
            ]
        };

        // Set Actions
        this._properties.table.actions = this._properties.actions;

        // Set Buttons
        this._properties.table.datatable.buttons = this._properties.buttons;

        // Set Column Definitions
        this._properties.table.datatable.columnDefs = this._properties.columns;

        // Setup Placeholder
        this._properties.table.datatable.initComplete = function(param) {
            $(param.nTableWrapper).find('.dataTables_filter input').attr({
                'placeholder': builder.Locale.get('Search...'),
            });
        };

        // Add Row Double Click Event
        this._properties.table.dblclick = this._properties.dblclick;
    }

    _create(){

        // Set Self
        const self = this;

        // Create Component
        this._component = $(document.createElement('div')).attr({
            'id': 'lead' + this._id,
            'class': 'index-layout',
        });
        this._component.id = this._component.attr('id');

        // Add Class
        if(this._properties.class.component){
            this._component.addClass(this._properties.class.component);
        }

        // Create the Table
        this._builder.Component(
            'datatable',
            this._component,
            this._properties.table,
            function(datatable, component){

                // Set _datatable
                self.datatable(datatable);

                // Retrieve Records
                $.ajax({
                    url: self._properties.url,
                    headers: {'X-CSRF-Authorization': CSRF_KEY},
                    type: 'POST',dataType: 'json',
                    data: {
                        conditions: self._properties.conditions,
                    },
                    error: function(xhr, status, error) {
                        let color = 'info', icon = 'question-circle', title = builder.Locale.get(xhr.statusText), content = builder.Locale.get(xhr.responseText);
                        switch(xhr.status){
                            case 403: color = 'danger'; icon = 'shield-lock'; break;
                            case 404: color = 'warning'; icon = 'question-diamond'; break;
                            case 500: color = 'danger'; icon = 'bug'; break;
                        }
                        self._builder.Component(
                            "alert",
                            self._component,
                            {
                                class: {
                                    component: 'm-3',
                                },
                                dismissible: false,
                                icon:icon,
                                color:color,
                                title:title
                            },
                            function(alert,component){
                                component.content.html('<pre class="m-0 p-2">'+content+'</pre>');
                            }
                        );
                    },
                    success: function(response) {

                        // Add Records
                        for(const [key, record] of Object.entries(response.records)){
                            self.add(record);
                        }
                    }
                });

                // Check if autoStart is enabled
                if(self._properties.autoStart){

                    // Start
                    self.start();
                }
            },
        );
    }

    datatable(datatable = null){
        if(datatable){
            this._datatable = datatable;
        }
        return this._datatable;
    }

    load(records = null){

        // Set Self
        const self = this;

        // Check if records are provided
        if(records !== null && Object.entries(records).length > 0){

            // Loop through the records
            for(const [key, record] of Object.entries(records)){
                self.add(record);
            }
            return this;
        }

        // Retrieve Records
        $.ajax({
            url: this._properties.url,
            headers: {'X-CSRF-Authorization': CSRF_KEY},
            type: 'POST',dataType: 'json',
            data: {
                conditions: this._properties.conditions,
            },
            error: function(xhr, status, error) {
                console.error('Error fetching data:', error);
            },
            success: function(response) {

                // Add Records
                for(const [key, record] of Object.entries(response.records)){
                    self.add(record);
                }
            }
        });

        return this;
    }

    start(){

        // Set Self
        const self = this;

        // Check if the interval is already set
        if(this.#interval){
            console.warn('Interval is already set, stopping the previous one.');
            clearInterval(this.#interval);
        }

        // Set the interval to check for changes
        this.#interval = setInterval(function(){
            self.load();
        }, this._properties.interval);
    }

    stop(){
        // Check if the interval is set
        if(this.#interval){
            clearInterval(this.#interval);
            this.#interval = null;
        } else {
            console.warn('No interval is currently set.');
        }
    }

    add(record){

        // Add Record
        this.datatable().add(record);

        return this;
    }
})







// builder.add('layouts','profile', class extends builder.ComponentClass {})
// builder.add('renderers', '', function(value, data){})
