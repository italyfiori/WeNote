var dom = require(rootpath + '/front/lib/dom.js')

var selectedImage = null

function setImageInit() {
    // 选中任意地方(除图像和设置大小输入框外)
    $(document).click(function(event) {
        if (selectedImage) {
            $(selectedImage).popover('hide')
            selectedImage = null
        }
    })
}

function setImageEvent() {
    selectedImage = null
    $('img').unbind()
    $('.image_size').unbind()

    var options = {
        html: true,
        content: '图像大小: &nbsp;<input type="text" class="image_size">',
        trigger: 'manual',
        placement: 'bottom',
    }

    // 设置弹出框
    $('img').popover(options)

    // 选中图像
    $('img').click(function(event) {
        // 选中了和上次不一样的图片
        if (selectedImage && this != selectedImage) {
            $(selectedImage).popover('hide')
        }

        // 设置大小弹出框
        $(this).popover('show')
        dom.selectNode(this)
        selectedImage = this
        event.stopPropagation();
    })

    // 弹出框弹出
    $('img').on('show.bs.popover', function() {
        $('.image_size').unbind()

        setTimeout(function() {

            $('.image_size').click(function(event) {
                $(this).focus()
                event.stopPropagation();
            })

            $('.image_size').val(selectedImage.width + 'px')

            $('.image_size').keypress(function(e) {
                if (e.key == 'Enter') {
                    var value = $(this).val()
                    if (/^\d+(px)?$/.test(value)) {
                        // console.log(123);
                        var size = value.indexOf('px') >= 0 ? value : value + 'px'
                        selectedImage.style.width = size
                        $(selectedImage).popover('hide')
                    }
                }
            })

        }, 100)
    })
}

exports.setImageEvent = setImageEvent
exports.setImageInit  = setImageInit
