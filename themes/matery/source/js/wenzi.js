/* 鼠标点击文字特效 */
var a_idx = 0;
jQuery(document).ready(function($) {
    $("body").click(function(e) {
        // var a = new Array("❤U ready？❤","❤Go！❤","❤抹茶炼乳❤","❤麻婆豆腐❤","❤凉拌皮蛋❤","❤孜然土豆❤","❤鲜辣鱼鳔❤","❤剁椒鱼头❤","❤油焖大虾❤","❤酱爆生蚝❤","❤红烧猪蹄❤","❤泡椒凤爪❤","❤酸辣鸡杂❤","❤椒盐排骨❤","❤香煎牛排❤","❤涮烤羊排❤","❤烟熏腊肉❤","❤吮指奥利给❤");
        var a = new Array("U ready？","Go！","抹茶炼乳","麻婆豆腐","凉拌皮蛋","孜然土豆","鲜辣鱼鳔","剁椒鱼头","油焖大虾","酱爆生蚝","红烧猪蹄","泡椒凤爪","酸辣鸡杂","椒盐排骨","香煎牛排","涮烤羊排","烟熏腊肉","吮指奥利给");
        var $i = $("<span></span>").text(a[a_idx]);
        a_idx = (a_idx + 1) % a.length;
        var x = e.pageX,
        y = e.pageY;
        $i.css({
            "z-index": 999999999999999999999999999999999999999999999999999999999999999999999,
            "top": y - 20,
            "left": x,
            "position": "absolute",
            "font-weight": "bold",
            "color": "rgb("+~~(255*Math.random())+","+~~(255*Math.random())+","+~~(255*Math.random())+")"
        });
        $("body").append($i);
        $i.animate({
            "top": y - 180,
            "opacity": 0
        },
        1500,
        function() {
            $i.remove();
        });
    });
});
