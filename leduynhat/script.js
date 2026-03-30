(function ($) {
    'use strict';

    /* =====================================================
     * 1. FLATTEN ROW → ĐẨY .col RA NGOÀI .slider
     * ===================================================== */
    function flattenSliderRows($slider) {
        $slider.find('> .row').each(function () {
            const $row = $(this);
            $row.children('.col').appendTo($slider);
            $row.remove();
        });
    }

    function equalizeCols(selector) {
        const items = document.querySelectorAll(selector);
        if (!items.length) return;

        // Reset height trước khi tính
        items.forEach(i => i.style.height = "auto");

        // Nhóm theo row
        let rows = [];
        let currentRow = [];
        let lastTop = null;

        const tolerance = 3;  // cho phép lệch pixel do zoom / gap

        items.forEach(el => {
            const top = Math.round(el.getBoundingClientRect().top);

            if (lastTop === null || Math.abs(top - lastTop) <= tolerance) {
                // Cùng hàng
                currentRow.push(el);
            } else {
                // Sang hàng mới
                rows.push(currentRow);
                currentRow = [el];
            }

            lastTop = top;
        });

        // Push hàng cuối
        if (currentRow.length) rows.push(currentRow);

        // Gán height tối đa cho từng hàng
        rows.forEach(row => {
            const max = Math.max(...row.map(r => r.offsetHeight));
            row.forEach(r => r.style.height = max + "px");
        });
    }
    window.equalizeCols = equalizeCols;

    /* =====================================================
     * 2. EQUAL HEIGHT FLICKITY CELLS (THEO CỘT)
     * ===================================================== */
    function equalizeFlickityCells($slider, selectorBase, totalItems = 3) {
        for (let i = 1; i <= totalItems; i++) {
            const $cells = $slider.find(`${selectorBase}:nth-child(${i})`);
            if (!$cells.length) continue;

            $cells.css('height', 'auto');

            let maxH = 0;
            $cells.each(function () {
                const h = this.getBoundingClientRect().height;
                if (h > maxH) maxH = h;
            });

            if (maxH > 0) {
                $cells.css('height', maxH + 'px');
            }
        }
    }

    /* =====================================================
     * 3. INIT EQUALIZER + RESPONSIVE LOGIC
     * ===================================================== */
    function initSliderEqualizer() {

        $(document).on(
            'flatsome-flickity-ready',
            '.row-slider .slider',
            function () {

                const $slider = $(this);
                const flkty = $slider.data('flickity');
                if (!flkty) return;

                let lastIsMobile = null;
                let resizeTimer = null;

                /* ---------- MAIN UPDATE ---------- */
                const updateLayout = () => {
                    const isMobile = window.innerWidth < 550;
                    const $cells = $slider.find('.col');

                    /* Chỉ update CSS khi breakpoint đổi */
                    if (isMobile !== lastIsMobile) {
                        lastIsMobile = isMobile;

                        if (isMobile) {
                            $cells.css({
                                'flex-basis': '65%',
                                'max-width': '65%',
                            });
                        } else {
                            $cells.css({
                                'flex-basis': '',
                                'max-width': '',
                            });
                        }
                    }

                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(() => {
                        flkty.resize();
                        flkty.reposition();
                        equalizeCols('.col-inner .section-title, .col-inner .text');
                        // equalizeFlickityCells($slider, '.col-inner .text', 3);
                    }, 100);
                };

                /* ---------- SET HEIGHT 1 LẦN SAU KHI ỔN ---------- */
                const setSliderHeightOnce = () => {
                    requestAnimationFrame(() => {
                        const h = flkty.maxCellHeight;
                        if (h > 0) {
                            $slider.css('height', h + 'px');
                            $slider.closest('.row-slider').css('height', h + 'px');
                        }
                        console.log('Set slider height:', flkty);
                    });
                };
                setSliderHeightOnce();
                // setTimeout(setSliderHeightOnce, 300);
                /* ---------- IMAGE LOAD ---------- */
                if (typeof $.fn.imagesLoaded === 'function') {
                    $slider.imagesLoaded(() => {
                        updateLayout();
                        setTimeout(setSliderHeightOnce, 300);
                    });
                } else {
                    updateLayout();
                    setTimeout(setSliderHeightOnce, 300);
                }

                /* ---------- FLICKITY EVENTS ---------- */

                flkty.on('settle', () => {
                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(updateLayout, 150);
                });

                /* ---------- WINDOW RESIZE ---------- */
                $(window).on('resize.sliderEqualizer', () => {
                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(updateLayout, 150);
                });
            }
        );
    }

    /* =====================================================
     * 4. DISABLE SLIDER KHI KHÔNG ĐỦ ITEM
     * ===================================================== */
    function initSliderDisableIfNotScrollable() {

        $(document).on(
            'flatsome-flickity-ready',
            '.slider-box .slider, .row-slider .slider',
            function () {
                let resizeTimer = null;
                const $slider = $(this);
                const flkty = $slider.data('flickity');
                if (!flkty) return;

                const checkActive = () => {
                    if (flkty.slideableWidth <= flkty.size.innerWidth) {
                        flkty.isActive = false;
                        flkty.isDraggable = false;

                        flkty.options.draggable = false;
                        flkty.options.freeScroll = false;
                        flkty.options.wrapAround = false;
                        flkty.options.pageDots = false;
                        flkty.options.prevNextButtons = false;

                        $slider.find('.flickity-button').hide();
                    }
                };

                checkActive();
                flkty.on('settle', () => checkActive());
                $(window).on('resize', () => {
                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(checkActive, 150);
                });
                flkty.on('resize', () => {
                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(checkActive, 150);
                });
            }
        );
    }

    /* =====================================================
     * 5. DOM READY – PHẢI LÀM TRƯỚC FLICKITY INIT
     * ===================================================== */
    function bootstrap() {
        $('.row-slider .slider, .slider-box .slider').each(function () {
            flattenSliderRows($(this));
        });

        initSliderEqualizer();
        initSliderDisableIfNotScrollable();
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }

    // bootstrap();

    // Custome 
    // Khi click nút đăng ký
    $(document).on('click', '.btn-register', function () {
        let namePackage = $(this)
            .closest('.col')
            .find('.section-title-main')
            .text()
            .trim();

        $('.lightbox-by-id input[name="your-package"]').val(namePackage);
        $('.view-package b').text(namePackage);
    });

    // Khi popup đóng (Magnific Popup)
    $(document).on('click', '.mfp-close', function () {
        setTimeout(function () {
            resetPackage();
        }, 300);
    });

    // Hàm reset
    function resetPackage() {
        const defaultText = 'Chưa chọn gói cụ thể nào!';
        $('.lightbox-by-id input[name="your-package"]').val(defaultText);
        $('.view-package b').text(defaultText);
    }
})(jQuery);
