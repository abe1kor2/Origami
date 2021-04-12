$(document).ready(function() {

    var balanceChart = 0;
   
    
    // makes a request to create the user's account
    function createAccount() {
        $.ajax({
            url: 'account/create',
            type: 'GET',
            contentType: 'application/JSON',
            success: function(response) {
                showPositions();
                showAccountValue();
            },
            error: function(xhr, status, error) {
                showPositions();
                showAccountValue();
            }
        })
    }


    // updates cash, market value and combined value of user's account
    function showAccountValue() {
        $.ajax({
            url: 'account/balance/cash',
            type: 'GET',
            contentType: 'application/JSON',
            success: function(response) {
                $("#cash").empty();
                $("#cash").append(response);
            }
        });
        $.ajax({
            url: 'account/balance/combined',
            type: 'GET',
            contentType: 'application/JSON',
            success: function(response) {
                $("#combined-value").empty();
                $("#combined-value").append(response);
            }
        });
        $.ajax({
            url: 'account/balance/market',
            type: 'GET',
            contentType: 'application/JSON',
            success: function(response) {
                $("#market-value").empty();
                $("#market-value").append(response);
                drawBalancePieChart();
            }
        });
    }

    // displays a pie chart plotting user's cash and market value
    function drawBalancePieChart() {
        if (balanceChart !== 0) balanceChart.destroy();
        $("#balanceChart").empty();
        balanceChart = new Chart(document.getElementById('balanceChart').getContext('2d'), {
            type: 'pie',
            data: {
                datasets: [{
                    data: [parseFloat($("#cash").val()), parseFloat($("#market-value").val())],
                    backgroundColor: [
                        'rgb(0, 255, 0)',
                        'rgb(173, 216, 230)'
                    ]
                }],

                labels: [
                    'Cash',
                    'Stocks'
                ],
            },
            options: {}
        });
        $("#balance-chart-container").show();
    }

    // displays a list of all information about positions held by user
    function showPositions() {

        // create the list
        let positions = '<ul id="positions" class="list-group list-group-flush tabl">';
        $("#stock-list").empty();
        $("#stock-list").append(positions);

        // get the user's positions
        $.ajax({
            url: '/account/positions',
            type: 'GET',
            contentType: 'application/JSON',
            success: function(response) {
                let positions = JSON.parse(response);
                let entry;
                let cur_price;
                for(let i = 0; i < positions.length; i++) {
                    let position = positions[i];

                    // get the current price of each position
                    $.ajax({
                        url: '/fh/price/c/' + position.symbol,
                        type: 'GET',
                        contentType: 'application/JSON',
                        success: function(response) {
                            cur_price = JSON.parse(response);

                            // append the postition info to the list
                            if(cur_price >= position.avgPrice) {
                                entry = '<ul class="list-group list-group-horizontal"><li class="list-group-item align-items-center"><button type="button" class="btn btn-outline-dark position-symbol" onclick="detailView(event)">'+position.symbol+'</button></li><li class="list-group-item align-items-center"><div class="alert alert-success cur-price">$'+cur_price+'</div></li><li class="list-group-item align-items-center"><div class="no-shares">Number of Shares: '+position.numShares+'</div></li><li class="list-group-item align-items-center"><div id="market-val">MarketValue: $'+position.numShares * cur_price+'</div></li></ul>'
                            }
                            else {
                                entry = '<ul class="list-group list-group-horizontal"><li class="list-group-item align-items-center"><button type="button" class="btn btn-outline-dark position-symbol" onclick="detailView(event)">'+position.symbol+'</button></li><li class="list-group-item align-items-center"><div class="alert alert-danger cur-price">$'+cur_price+'</div></li><li class="list-group-item align-items-center"><div class="no-shares">Number of Shares: '+position.numShares+'</div></li><li class="list-group-item align-items-center"><div id="market-val">MarketValue: $'+position.numShares * cur_price+'</div></li></ul>'
                            }
                            $("#positions").append(entry);
                        },
                        error: function(xhr, status, error) {
                            var errorMessage = xhr.status + ': ' + xhr.statusText
                            alert('Error - ' + errorMessage);
                        }
                    })
                }
            },
            error: function(xhr, status, error) {
                var errorMessage = xhr.status + ': ' + xhr.statusText
                alert('Error - ' + errorMessage);
            }
        })
    }    

    // displays a list of all stocks in the user's watchlist
    function showWatchlist() {

        // create the list and display it
        let watched = '<ul id="watched" class="list-group list-group-flush tabl">';
        $("#stock-list").empty();
        $("#stock-list").append(watched);

        // get all stocks on the user's watchlist
        $.ajax({
            url: '/account/watchlist',
            type: 'GET',
            contentType: 'application/JSON',
            success: function(response) {
                let watched = JSON.parse(response);
                let entry;
                let cur_price;
                for(let i = 0; i < watched.length; i++) {
                    let position = watched[i];

                    // get the current price of each stock on the watchlist
                    $.ajax({
                        url: '/fh/price/c/' + position.symbol,
                        type: 'GET',
                        contentType: 'appliaction/JSON',
                        success: function(response) {
                            cur_price = JSON.parse(response);

                            // append the stock's info to the list
                            if(cur_price >= position.avgPrice) {
                                entry = '<ul class="list-group list-group-horizontal"><li class="list-group-item align-items-center"><button type="button" class="btn btn-outline-dark position-symbol" onclick="detailView(event)">'+position.symbol+'</button></li><li class="list-group-item align-items-center"><div class="alert alert-success cur-price">'+cur_price+'</div></li></ul>'
                            }
                            else {
                                entry = '<ul class="list-group list-group-horizontal"><li class="list-group-item align-items-center"><button type="button" class="btn btn-outline-dark position-symbol" onclick="detailView(event)">'+position.symbol+'</button></li><li class="list-group-item align-items-center"><div class="alert alert-danger cur-price">'+cur_price+'</div></li></ul>'
                            }
                            $("#watched").append(entry);
                        },
                        error: function(xhr, status, error) {
                            var errorMessage = xhr.status + ': ' + xhr.statusText
                            alert('Error - ' + errorMessage);
                        }
                    })
                }
            },
            error: function(xhr, status, error) {
                var errorMessage = xhr.status + ': ' + xhr.statusText
                alert('Error - ' + errorMessage);
            }
        })
    } 

    // deposits the inputted money to the users account
    $("#deposit-btn").click(function(event) {
        event.preventDefault();
        let cash = parseFloat($("#cash-amount").val());
        let money = {}
        money.amount = cash;
        $.ajax({
            url: '/account/balance/cash/deposit',
            type: 'PUT',
            contentType: 'application/JSON',
            data: JSON.stringify(money),
            success: function(response) {
                showAccountValue();
            }
        });
    });

    // withdraws the inputted money to the user's account
    $("#withdraw-btn").click(function(event) {
        event.preventDefault();
        let cash = parseFloat($("#cash-amount").val());
        let money = {}
        money.amount = cash
        $.ajax({
            url: '/account/balance/cash/withdraw',
            type: 'PUT',
            contentType: 'application/JSON',
            data: JSON.stringify(money),
            success: function(response) {
                showAccountValue();
            }
        });
    });

    // displays the account options on the dashboard
    $("#manage-account-btn").click(function(event) {
        event.preventDefault();
        $("#detailed-view").hide();
        $("#position-table").hide();
        $("#manage-account").show();
    })

    // displays the dashboard and position table
    $("#dashboard-btn").click(function(event) {
        event.preventDefault()
        $("#detailed-view").hide();
        $("#position-table").show();
        $("#manage-account").hide();
        showAccountValue();
        $("#dashboard-btns").show();
        showPositions();
    }) 

    // displays the position table
    $("#positions-btn").click(function(event) {
        event.preventDefault();
        $("#position-table").show();
        $("#manage-account").hide();
        showPositions();
    });

    // displays the watchlist
    $("#watchlist-btn").click(function(event) {
        $("#manage-account").hide();
        $("#position-table").show();
        showWatchlist();
    })

    // creates an alert for each pposition in the position list
    // to go to the detailed view
    $(".position-symbol").click(function(event) {
        alert($(this).val())
    })

    // when page refreshes
    // try to create an account
    createAccount();

    // make sure detailed view and manage account are hidden
    $("#detailed-view").hide();
    $("#manage-account").hide();
})