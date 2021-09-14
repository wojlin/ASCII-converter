var offset = [], dims = [], $body, $cursor;
$body = $('body');
$cursor = $('#cursor');
offset = [($body.outerWidth() - $body.innerWidth()) / 2, ($body.outerHeight() - $body.innerHeight()) / 2];
dims = [$cursor.width(), parseInt($cursor.css('line-height'))];

$(document).on('mousemove', function (e)
{
    var left, top;
    left = Math.round((e.pageX - dims[0] / 2) / dims[0]) * dims[0] + offset[0];
    top = Math.round((e.pageY - dims[1] / 2) / dims[1]) * dims[1] + offset[1];
    $cursor.css({ top: top , left: left });
});
