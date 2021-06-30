---
# Liquid pretreatment required
---
    
function getQuery(key) {
    var query = window.location.search.substring(1);
    var map = query.split("&");
    for (var i = 0; i < map.length; i++) {
        var pair = map[i].split("=");
        if (pair[0] == key) {
        return pair[1];
        }
    }
}

var keyword = getQuery('keyword');

function replaceStr(str, index, char) {
    const strAry = str.split('');
    strAry[index] = char;
    return strAry.join('');
}

// 请求 API 获得数据
var tagsData;
var xhrPosts = new XMLHttpRequest();
xhrPosts.open('GET', '../tags.json', true);
xhrPosts.onreadystatechange = function() {
    if (xhrPosts.readyState == 4 && xhrPosts.status == 200) {
        console.log('responseText:',xhrPosts.responseText)
        
        var idx = xhrPosts.responseText.lastIndexOf(',');
        var str = replaceStr(xhrPosts.responseText, idx, '');
        tagsData = JSON.parse(str);
        
        if(keyword){
            tags(decodeURI(keyword));
        }
    }
}
xhrPosts.send(null);

// 显示 tag 对应文章标题列表并修改 title 等
function tags (keyword){
    var title = '标签：' + keyword + ' | Fooleap\'s Blog';
    var url = '/tags.html?keyword=' + keyword;
    var tagsTable = document.getElementById('tags-table');
    tagsTable.style.display = 'table';
    tagsTable.querySelector('thead tr').innerHTML = '<th colspan=2>以下是标签为“'+keyword+'”的所有文章</th>';
    var html = '';
    tagsData.forEach(function(item){
        if( item.tags.indexOf(keyword) > -1){
            var date = item.date.slice(0,10).split('-');
            date = date[0] + ' 年 ' + date[1] + ' 月 ' + date[2] + ' 日';
            html += '<tr>'+
                 '<td><time>'+date+'</time></td>'+
                 '<td><a href="'+item.url+'" title="'+item.title+'">'+item.title+'</a></td>'+
                 '</tr>';
        }
    })
    tagsTable.getElementsByTagName('tbody')[0].innerHTML = html;
    document.title = title;
    history.replaceState({ 
        "title": title,
        "url": url 
    }, title, url);
}

// 给 tag 链接绑定事件
var tagLinks = document.getElementsByClassName('post-tags-item');
var tagCount = tagLinks.length;
for (var i = 0; i < tagCount; i++){
    tagLinks[i].addEventListener('click', function(e){
        tags(e.currentTarget.title);
        e.preventDefault();
    }, false);
}
