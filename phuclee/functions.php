<?php
// Add custom Theme Functions here
//Remove the REST API endpoint.
remove_action('rest_api_init', 'wp_oembed_register_route');

// Turn off oEmbed auto discovery.
add_filter('embed_oembed_discover', '__return_false');

//Don't filter oEmbed results.
remove_filter('oembed_dataparse', 'wp_filter_oembed_result', 10);

//Remove oEmbed discovery links.
remove_action('wp_head', 'wp_oembed_add_discovery_links');

//Remove oEmbed JavaScript from the front-end and back-end.
remove_action('wp_head', 'wp_oembed_add_host_js');

//=======Tắt XML-RPC
add_filter('xmlrpc_enabled', '__return_false');
// add_filter('wp_headers', 'ldn_remove_x_pingback');
add_filter('wpcf7_autop_or_not', '__return_false');
add_filter('pings_open', '__return_false', 9999);
add_filter('pre_update_option_enable_xmlrpc', '__return_false');
add_filter('pre_option_enable_xmlrpc', '__return_zero');

// Xóa ô mô tả mặc định trong form chỉnh sửa danh mục sản phẩm
remove_filter('pre_term_description', 'wp_filter_kses', 9999);
remove_filter('term_description', 'wp_kses_data', 9999);
wp_enqueue_script('custome-script', get_stylesheet_directory_uri() . '/script.js', array('jquery'), '', true);


/* Xóa thông báo Bản Quyền Flatsome */
delete_option('flatsome_wupdates');
add_action('init', function () {
    remove_action('tgmpa_register', 'flatsome_register_required_plugins');
    remove_action('admin_notices', 'flatsome_maintenance_admin_notice');
});

/* Xóa các thông báo khó chịu của Woocommerce */
add_action('admin_head', function () {
    echo '<style>.notice-info,#woocommerce-embedded-root,.woocommerce-message.updated{display: none;}#wpbody{margin-top: 10px !important;}#wp-content-editor-tools{background-color: #f0f0f1 !important;}</style>';
});

/* Xóa các Size hình ảnh mặc định của WordPress */
function realdev_remove_default_image_sizes($sizes)
{
    unset($sizes['large']);
    unset($sizes['thumbnail']);
    unset($sizes['medium']);
    unset($sizes['medium_large']);
    unset($sizes['1536x1536']);
    unset($sizes['2048x2048']);
    return $sizes;
}
add_filter('intermediate_image_sizes_advanced', 'realdev_remove_default_image_sizes');

/*=======Xoa css block WordPress khong su dung */
// Fully Disable Gutenberg editor.
add_filter('use_block_editor_for_post_type', '__return_false', 10);
// Don't load Gutenberg-related stylesheets.
add_action('wp_enqueue_scripts', 'remove_block_css', 100);
function remove_block_css()
{
    wp_dequeue_style('wp-block-library');
    wp_dequeue_style('wp-block-library-theme');
    wp_dequeue_style('wc-block-style');
}
add_action('wp_footer', 'remove_wc_blocks_style_footer', PHP_INT_MAX);
function remove_wc_blocks_style_footer()
{
    wp_dequeue_style('wc-blocks-style');
    wp_deregister_style('wc-blocks-style');
}
add_filter('style_loader_tag', 'remove_wc_blocks_style_tag', PHP_INT_MAX, 2);
function remove_wc_blocks_style_tag($html, $handle)
{
    if ($handle === 'wc-blocks-style') {
        return '';
    }
    return $html;
}

//=======Dịch các từ tiếng anh sang tiếng việt
function my_custom_translations($strings)
{
    $text = array(
        'Quick View' => 'Xem nhanh',
        'View more' => 'Xem thêm',
        'Mô tả' => 'Mô tả sản phẩm',
        'SHOPPING CART' => 'Giỏ hàng',
        'CHECKOUT DETAILS' => 'Thông tin thanh toán',
        'ORDER COMPLETE' => 'Hoàn tất đặt hàng',
        'CATEGORY ARCHIVES' => 'Chuyên mục',
        'MY ACCOUNT' => 'Tài khoản của tôi',
        'Đọc tiếp' => 'Xem thêm',
        'Lọc' => 'Bộ lọc',
    );
    $strings = str_ireplace(array_keys($text), $text, $strings);
    return $strings;
}
add_filter('gettext', 'my_custom_translations', 20);

function rm_breadcrumbs()
{
    if (!is_home()) {
        if (function_exists('rank_math_the_breadcrumbs')) {
?>
            <div class="row row-large row-divided row-breadcrumb">
                <div class="large-12 col my-breadcrumbs" style="padding-bottom: 0; text-align: center;">
                    <?php rank_math_the_breadcrumbs(); ?>
                </div>
            </div>
    <?php
        }
    }
}

add_action('flatsome_before_blog', 'rm_breadcrumbs');
add_action('flatsome_before_page_content', 'rm_breadcrumbs');
// add_action('flatsome_before_page', 'rm_breadcrumbs');
add_shortcode('rm_breadcrumbs', 'rm_breadcrumbs');