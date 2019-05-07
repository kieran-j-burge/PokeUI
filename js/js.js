
$( document ).ready(function() {

    var pokemonOne = null;
    var pokemonTwo = null;

    centerV();
    renderFavourites();
    autoSearchToggle();

    //Center elements vertically
    function centerV() {
        var elements = document.querySelectorAll(".center-v");
        Array.prototype.forEach.call(elements, function(element, index) {
            element.style.marginTop =
                "" +
                (element.closest("#pokemon-show-container").offsetHeight / 2 - element.offsetHeight / 2) +
                "px";
        });
    }

    //Re-renders the favourites by clearing all current pokemon and getting the updated list from local storage
    function renderFavourites() {
        var favList = JSON.parse(localStorage.getItem("fav-list"));
        if (favList != null){
            $("#favourite-dropdown-list").empty();
            favList.forEach(function (pokemon) {
                $("#favourite-dropdown-list").append('<li class="dropdown-item poke-dropdown" ><span class="key">'+pokemon.id+'</span>: <span class="name">'+pokemon.name+'</span> <button class="btn btn-danger delete-fav float-right" id="btn-delete_'+pokemon.id+'">X</button><button class="btn btn-warning add-fav-right float-right" id="btn-add-right_\'+pokemon.id+\'"> Pokemon 2</button><button class="btn btn-success add-fav-left float-right" id="btn-add-left_'+pokemon.id+'"> Pokemon 1</button></li>')
            });
        }
    }

    //Handles the change is the advanced search toggling
    function autoSearchToggle(){
        var adSearchOn = localStorage.getItem("adSearch");
        if (adSearchOn != null){
            if(~adSearchOn.indexOf("on")){
                $('#ad-search-toggle').prop('checked', true);
                var key = localStorage.getItem("currentKey");
                if(key != null){
                    storePokemonLocal(key);
                }
                else if (key>=810 && localStorage.getItem("pokemonLocalList") != null || key == null && localStorage.getItem("pokemonLocalList") != null){
                }
                else{
                    storePokemonLocal(1);
                }
            }
        }
        else{
            $('#ad-search-toggle').prop('checked', false);
            localStorage.setItem("adSearch","off")
        }
    }

    //Retreives pokemon information from API ranging from id 1 - 810
    function storePokemonLocal(key) {
        for(var i = key; i<= 810; i++){
            $.ajax({ cache: false,
                url: "https://pokeapi.co/api/v2/pokemon/"+i+"/",
                success: function (json) {
                    addToLocalList(json.name,json.id);
                },
                error:function (xhr, ajaxOptions, thrownError){
                    if(xhr.status==404) {
                    }
                }
            });
            localStorage.setItem("currentKey",i);
        }
    }

    //Adds the pokemon key and name data to local storage
    function addToLocalList(name,id){
        var localList = JSON.parse(localStorage.getItem("pokemonLocalList"));
        if (localList!= null){
            localList.push({
                id:id,
                name:name
            });
            localStorage.setItem("pokemonLocalList",JSON.stringify(localList));
        }
        else {
            localStorage.setItem("pokemonLocalList",JSON.stringify([{id:id,name:name}]));
        }
    }


    //Function to get pokemon from the API
    function getPokemon(string,id) {
        $.ajax({ cache: false,
            url: "https://pokeapi.co/api/v2/pokemon/"+string+"/",
            success: function (json) {
            renderPokemonOnUI(json,id);
            if(id == 1){
                pokemonOne = json;
            }
            else if(id == 2){
                pokemonTwo = json;
            }
            if(pokemonOne != null && pokemonTwo != null){
                comparisonGraph();
            }
            },
            error:function (xhr, ajaxOptions, thrownError){
                if(xhr.status==404) {
                    console.log("No pokemon found with name: " + string)
                }
            }
        });
    }

    //Renders the pokemon information in the desired pokemon container
    function renderPokemonOnUI(pokemonJson,id){
        var img = pokemonJson.sprites.front_default;
        var stats = pokemonJson.stats;
        var moves = pokemonJson.moves;
        var weight = pokemonJson.weight;
        var sprites = pokemonJson.sprites;
        $("#pokemon"+id+"-img").attr("src",img);

        $("#pokemon"+id+"-stats-container").find(".name").text(pokemonJson.name);

        $("#pokemon"+id+"-stats-container").find(".sec-img-container").find(".back_default").attr("src",sprites.back_default);
        $("#pokemon"+id+"-stats-container").find(".sec-img-container").find(".back_shiny").attr("src",sprites.back_shiny);
        $("#pokemon"+id+"-stats-container").find(".sec-img-container").find(".front_default").attr("src",sprites.front_default);
        $("#pokemon"+id+"-stats-container").find(".sec-img-container").find(".front_shiny").attr("src",sprites.front_shiny);

        $("#pokemon"+id+"-stats-container").find(".stats-container").empty();
            stats.forEach(function (stat) {
            $("#pokemon"+id+"-stats-container").find(".stats-container").append('<div class="stat">\n' +
                '                    <h2 class="base-stat">'+getProgressBar("bs",stat)+'</h2>\n' +
                '                  </div>');
        });

        isFavourite(pokemonJson.id,id)

    }

    // Checks if the pokemon is a favourite already
    function isFavourite(currentId,id){
        var listJSON = JSON.parse(localStorage.getItem("fav-list"));
        var isFav = false;
        listJSON.forEach(function (pokemon) {
            if (parseInt(pokemon.id) == parseInt(currentId)){
                $("#pokemon-"+id).find(".favourite-icon-container").find(".favourite").text("Added!");
                isFav = true;
            }
        });
        if (!isFav){
            $("#pokemon-"+id).find(".favourite-icon-container").find(".favourite").text("Favourite");
        }
    }

    //Renders progress bar dynamically
    function getProgressBar(key,stat){
        var percentage = stat.base_stat /120 * 100;
        var colour;
        if(percentage <= 25){
            colour = "danger";
        }else if(percentage >=25 && percentage <=40){
            colour = "warning";
        }else{
            colour = "success";
        }
        var progressBar = ('<div class="progress"> <div class="progress-bar bg-'+colour+'" role="progressbar" style="width: '+percentage+'%" aria-valuenow="'+percentage+'" aria-valuemin="0" aria-valuemax="100">'+stat.stat.name+': '+stat.base_stat+'</div> </div>');

        return progressBar;
    }

    //Renders comparison graph when two pokemon are present
    function comparisonGraph(){

        CanvasJS.addColorSet("greenShades",
            [//colorSet Array

                "#ffcc03",
                "#4F81BC",
            ]);

        var chart = new CanvasJS.Chart("chartContainer", {
            colorSet: "greenShades",
            exportEnabled: true,
            animationEnabled: true,
            title:{
                text: "Stat Comparison"
            },
            axisX: {
                title: "Stats"
            },
            axisY: {
                title: "Stats",
                titleFontColor: "#ffcc03",
                lineColor: "#ffcc03",
                labelFontColor: "#ffcc03",
                tickColor: "#ffcc03"
            },
            // axisY2: {
            //     title: pokemonTwo.name,
            //     titleFontColor: "#4F81BC",
            //     lineColor: "#4F81BC",
            //     labelFontColor: "#4F81BC",
            //     tickColor: "#4F81BC"
            // },
            toolTip: {
                shared: true
            },
            legend: {
                cursor: "pointer",
                itemclick: toggleDataSeries
            },
            data: [{
                type: "column",
                name: pokemonOne.name,
                showInLegend: true,
                yValueFormatString: "",
                dataPoints: [
                    { label: "Speed",  y: pokemonOne.stats[0].base_stat},
                    { label: "Special-Defense", y: pokemonOne.stats[1].base_stat  },
                    { label: "Special-Attack", y: pokemonOne.stats[2].base_stat },
                    { label: "Defense",  y: pokemonOne.stats[3].base_stat  },
                    { label: "Attack",  y: pokemonOne.stats[4].base_stat  },
                    { label: "HP",  y: pokemonOne.stats[5].base_stat  },
                ]
            },
                {
                    type: "column",
                    name: pokemonTwo.name,
                    showInLegend: true,
                    yValueFormatString: "",
                    dataPoints: [
                        { label: "Speed",  y: pokemonTwo.stats[0].base_stat},
                        { label: "Special-Defense", y: pokemonTwo.stats[1].base_stat  },
                        { label: "Special-Attack", y: pokemonTwo.stats[2].base_stat },
                        { label: "Defense",  y: pokemonTwo.stats[3].base_stat  },
                        { label: "Attack",  y: pokemonTwo.stats[4].base_stat  },
                        { label: "HP",  y: pokemonTwo.stats[5].base_stat  },
                    ]
                }]
        });
        chart.render();
    }


    function toggleDataSeries(e) {
        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        } else {
            e.dataSeries.visible = true;
        }
        e.chart.render();
    }


    //Handles search button for string searching pokemon in API
    $(".pokemon-search-btn").on('click',function(e) {
        if(~$(this).attr('id').indexOf("btn-pokemon1-search")){
            var string = $("#pokemon1-search").val();
            getPokemon(string,1);
        }
        else if(~$(this).attr('id').indexOf("btn-pokemon2-search")){
            var string = $("#pokemon2-search").val();
            getPokemon(string,2);
        }
    });


    //Randomises a number and sends it to get pokemon in desired container
    $(".random-btn").on('click',function(e) {
        if(~$(this).attr('id').indexOf("random-1")){
            getPokemon(Math.floor((Math.random() * 823) + 1),1);
        }
        else if(~$(this).attr('id').indexOf("random-2")){
            getPokemon(Math.floor((Math.random() * 823) + 1),2);
        }
    });

    //Handles both favourite buttons and adds the current pokemon data to local storage
    $(".btn-fav").on('click',function(e) {
        var listJSON = JSON.parse(localStorage.getItem("fav-list"));
        var button;
        var pokemon;
        if (~$(this).attr('id').indexOf("btn-fav-1")){
            pokemon = pokemonOne;
            button = this;
        }
        else if(~$(this).attr('id').indexOf("btn-fav-2")){
            button = this;
            pokemon = pokemonTwo;
        }

        if (listJSON != null){
            var check = checkIfDuplicate(listJSON,pokemon);
            if(!checkIfDuplicate(listJSON,pokemon)){
                listJSON.push(pokemon);
                $(button).text("Added!");
            }
            else{
                alert("You already have this pokemon as a favourite or you have not selected a pokemon")
            }
        }else {
            try {
                listJSON = [{id:pokemon.id, name:pokemon.name}];
            }catch (e){
                alert("Search for a pokemon first");
            }
        }
        localStorage.setItem("fav-list", JSON.stringify(listJSON));
    });

    //Remove favourites
    $(document.body).on('click', '.delete-fav' ,function(){
        var pokemonList = JSON.parse(localStorage.getItem("fav-list"));
        var self = this;
        var i =0;
        var id;
        pokemonList.forEach(function (pokemon) {
            if(pokemon.id == parseInt($(self).attr("id").split("_")[1])){
                id = i
            }
            else{
                i++;
            }
        });
        pokemonList.splice(id,1);
        console.log(pokemonList.length);
        if (pokemonList.length ==-1){
            localStorage.removeItem("fav-list")
        }else {
            localStorage.setItem("fav-list",JSON.stringify(pokemonList));
        }
        renderFavourites();
    });


    // Handles change in advanced search toggle
    $("#ad-search-toggle").on('click',function(e) {
        var toggle;
        if(!$('#ad-search-toggle').prop('checked') && localStorage.getItem("adSearch") == "on"){
            localStorage.setItem("adSearch","off");
            $('#ad-search-toggle').prop('checked', false);
        }
        else if($('#ad-search-toggle').prop('checked') && localStorage.getItem("adSearch") == "off"){

            localStorage.setItem("adSearch","on");
            $('#ad-search-toggle').prop('checked', true);
        }
        else{
            localStorage.setItem("adSearch","off");
            $('#ad-search-toggle').prop('checked', false);
        }
        autoSearchToggle();
    });

    // Re render the list for the favourites to account for newly added pokemon
    $("#favourite-dropdown-btn").on('click',function(e) {
        renderFavourites();
    });

    // On click for dynamically added buttons to add pokemon to the 1st container
    $(document.body).on('click', '.add-fav-left' ,function(){
        getPokemon($(this).closest(".poke-dropdown").find(".key").text(),1);
    });

    // On click for dynamically added buttons to add pokemon to the 2nd container
    $(document.body).on('click', '.add-fav-right' ,function(){
        getPokemon($(this).closest(".poke-dropdown").find(".key").text(),2);
    });

    // On key press of input search boxes
    $(".poke-search").keyup(function(e) {
        var string = $(this).val();
        console.log(string);
        if(~localStorage.getItem("adSearch").indexOf("on") && string != ""){
            var pokemonList = JSON.parse("[]");
            var localStorageList = JSON.parse(localStorage.getItem("pokemonLocalList"));

            localStorageList.forEach(function (pokemon) {
                if (pokemon.name.includes(string)){
                    pokemonList.push(pokemon);
                }
            });
            pokemonList = pokemonList.sort(function(a, b) {
                return a.id - b.id;
            });

            var resultHeight = $(this).outerHeight();
            var resultWidth = $(this).outerWidth();
            $(this).siblings(".search-results").css("top",resultHeight);
            $(this).siblings(".search-results").css("width",resultWidth);
            $(this).siblings(".search-results").css("padding",10);
            var resultContainer = $(this).siblings(".search-results");

            resultContainer.empty();
            resultContainer.show();
            pokemonList.forEach(function (pokemon) {
                resultContainer.append('<li class="search-result-item"><span class="pokemon-id">'+pokemon.id+'</span>. '+pokemon.name+'<button class="btn btn-success btn-pokemon-add float-right">Add</button></li>');
            });

        }
    });

    // On click for dynamically added buttons to add pokemon via advanced search button
    $(document.body).on('click', '.btn-pokemon-add' ,function(){
        if($(this).closest(".search-results").siblings('.poke-search').attr('id').includes("1")){
            getPokemon($(this).siblings(".pokemon-id").text(),1)
        }
        else if($(this).closest(".search-results").siblings('.poke-search').attr('id').includes("2")){
            getPokemon($(this).siblings(".pokemon-id").text(),2)
        }
        $(".search-results").hide();
    });

    $(document).mouseup(function(e)
    {
        var container = $(".search-results");

        // if the target of the click isn't the container nor a descendant of the container
        if (!container.is(e.target) && container.has(e.target).length === 0)
        {
            container.hide();
        }
    });

    // Checks for duplicates in the favourite list
    function checkIfDuplicate(favList,checkPokemon){
    var check = false;
    favList.forEach(function (pokemon) {
        if(pokemon.id == checkPokemon.id){
            check = true;
        }
    });
    return check;
    }


    //Model functions
    // Get the modal
    var modal = document.getElementById('ad-search-model');

    // Get the button that opens the modal
        var btn = document.getElementById("myBtn");

    // Get the <span> element that closes the modal
        var span = document.getElementsByClassName("close")[0];

    // When the user clicks on the button, open the modal
        btn.onclick = function() {
            modal.style.display = "block";
        }

    // When the user clicks on <span> (x), close the modal
        span.onclick = function() {
            modal.style.display = "none";
        }

    // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }


});
