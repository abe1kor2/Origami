$(document).ready(function() {
    
    // shows detailed view
    window.detailView = function(symbol) {

        // find the symbol of button click in position list
        if (symbol instanceof Event)
        {
            symbol = symbol.target.firstChild.nodeValue
        }

        // only show the detailed view
        $("#dashboard-btns").hide();
        $("#position-table").hide();
        $("#detailed-view").show();
        $("#manage-account").hide();
        $("#balance-chart-container").hide();
        $("#symbol-name").text(symbol);
        
        // get company name
        $.ajax({
            url:'/fh/search/' + symbol,
            type: 'GET',
            contentType: 'application/JSON',
            success: function(response) {
                let parsed_response = JSON.parse(response);
                $("#company-name").text(parsed_response.result[0].description);
            }
        })

        // get financial info
        $.ajax({
            url: '/fh/price/' + symbol,
            type: 'GET',
            contentType: 'application/JSON',
            success: function(response) {
                let parsed_response = JSON.parse(response);
                $("#cur-value").text(parsed_response.c);
                $("#open").text(parsed_response.o);
                $("#high").text(parsed_response.h);
                $("#low").text(parsed_response.l);
                $("#pc").text(parsed_response.pc);
                $("#time-of-day").text(new Date);
            }
        })

        //get number of shares owned by user
        $.ajax({
            url: '/account/positions/' + symbol,
            type: 'GET',
            contentType: 'application/JSON',
            success: function(response) {
                let parsed_response = JSON.parse(response);
                $("#shares-owned").text(parsed_response.numShares);
            },
            error: function(xhr, status, error) {
                $("#shares-owned").text(0);
            },
        });

        // embed stock chart
        new TradingView.widget(
        {
            "width": 780,
            "height": 410,
            "symbol": "NASDAQ:"+symbol,
            "interval": "D",
            "timezone": "Etc/UTC",
            "theme": "light",
            "style": "2",
            "locale": "en",
            "toolbar_bg": "#f1f3f6",
            "enable_publishing": false,
            "allow_symbol_change": false,
            "container_id": "tradingview_3787c"
        });
    }

    $(".position-symbol").click(function(event) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.preventDefault();
        detailView($(this).attr("value"));
        
    })

    // search for stock symbol
    $("#search-btn").click(function(event) {
        $.ajax({
            url:'/fh/search/' + $("#search-input").val(),
            type: 'GET',
            contentType: 'application/JSON',
            success: function(response) {
                let parsed_response = JSON.parse(response);
                let symbol = parsed_response.result[0].symbol;
                detailView(symbol);
            },
            error: function(xhr, status, error) {
                var errorMessage = xhr.status + ': ' + xhr.statusText
                alert('Error - ' + errorMessage);
            }
        })
    })

    // purchase inputted number of shares of a stock
    $("#buy-btn").click(function(event) {
        $.ajax({
            url: '/account/buy/',
            type: 'POST',
            contentType: 'application/JSON',
            data: `{
                "${$("#symbol-name").val()}" : ${$("#shares-to-buy").val()}
            }`,
            success: function(response) {
                alert(response);
            },
            error: function(xhr, status, error) {
                var errorMessage = xhr.status + ': ' + xhr.statusText
                alert('Error - ' + errorMessage);
            }
        })
    })

    // sell inputted number of shares of a stock
    $("#sell-btn").click(function(event) {
        $.ajax({
            url: '/account/sell/',
            type: 'POST',
            contentType: 'application/JSON',
            data: `{
                "${$("#symbol-name").val()}" : ${$("#shares-to-buy").val()}
            }`,
            success: function(response) {
                alert(response);
            },
            error: function(xhr, status, error) {
                var errorMessage = xhr.status + ': ' + xhr.statusText
                alert('Error - ' + errorMessage);
            }
        })
    })

    // calculate the cost of inputted number of shares of a stock
    $("#estimate-price-btn").click(function(event) {
        $.ajax({
            url: `/fh/price/c/${$("#symbol-name").val()}`,
            type: 'GET',
            contentType: 'application/JSON',
            success: function(response) {
                alert(`That order will cost: ${response * $("#shares-to-buy").val()}`);
            },
            error: function(xhr, status, error) {
                var errorMessage = xhr.status + ': ' + xhr.statusText
                alert('Error - ' + errorMessage);
            }
        })
    })
    
    // add a stock to user's watchlist
    $("#add-to-watchlist-btn").click(function(event) {
        let to_add = {};
        to_add.symbol = $("#symbol-name").val();
        $.ajax({
            url: '/account/watchlist/add',
            type: 'POST',
            contentType: 'application/JSON',
            data: JSON.stringify(to_add),
            success: function(response) {
                alert('Added '+$("#symbol-name").val()+' to watchlist.');
            },
            error: function(xhr, status, error) {
                var errorMessage = xhr.status + ': ' + xhr.statusText
                alert('Error - ' + errorMessage);
            }
        })
    }) 
});
