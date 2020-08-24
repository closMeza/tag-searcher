//'use strict'; this prevents the use of undeclared variables
var list;
var overlay;
var searchLabel;
var searchBtn;
var showcaseFrame;
var tagToggle;
var map; // handling first
var mapOverlay;
var mapToggle; // handling last
var minX, minY, maxX, maxY; // coords related to map

var settings = {
    sweep: '',
    mode: 'INSIDE',
    transition: 'FLY'
  };

// This sets the global vars above and sets up connection
// to matterport once the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    showcaseFrame = document.getElementById('showcase_iframe');

    searchLabel = document.getElementById('search-bar');
    searchBtn = document.getElementById('search-btn')
    list = document.getElementById('mt-container');

    overlay = document.getElementById('overlay-container');
    tagToggle = document.getElementById('overlay-toggle');
    overlay.style.visibility = 'hidden';

    map = document.getElementById('map');
    mapToggle = document.getElementById('minimap-toggle');
    mapOverlay = document.getElementById('minimap-overlay');
    mapOverlay.style.visibility = 'hidden';

    showcaseFrame.addEventListener('load', showcaseLoader, true);

})

/**
 * Author: Carlos Meza
 * Date: 08/14/2020
 * Description: This function sets initiatest the connection to the matterport SDK
 */
function showcaseLoader()
{
    try
    {
        window.MP_SDK.connect(showcaseFrame,  '6bdbe628d7b3445ca26b16a311306d0e', '3.4' )
            .then(showcaseHandler)
            .catch((e) => console.log(e));
    }
    catch(e)
    {
        console.log(e);
    }
}

/**
 * Author: Carlos Meza
 * Date: 08/14/2020
 * Input: mpSdk The Primary Object that contains all of Matterports SDk functionality
 * Description: This is where all the interaction for the Matterport Model takes place 
 */
async function showcaseHandler(mpSdk)
{
    console.log("Connected to Matterport SDK");
    var model = await mpSdk.Model.getData();
    console.log("Connected to " + model.sid);

    // displays overlays
    overlay.style.visibility = 'visible';
    mapOverlay.style.visibility = 'visible';

    // MiniMap functionality begins here
    var mattertags = await mpSdk.Mattertag.getData();

    // initatinig coords for sweeps in minimap
    minX = maxX = minY = maxY =0;

    // initializes array of sweeps
    // utilizing js array function map to feed an array of sweeps
    // which is defined as objects with sweep id and x/z coords
    var sweeps = model.sweeps.map((sweep)=> {
        if(sweep.position)
        {
            var marker = {
                mid: sweep.uuid,
                x: sweep.position.x || 0,
                y: sweep.position.z || 0
            }

            // initaitilzes coords with appropiate values
            setCoords(marker.x, marker.y);

            // gets the positon of the first sweep and stores it into settings object 
            // from above
            if(marker.x ==0 && marker.y ==0)
            {
                settings.sweep = sweep.uuid;
            }
  
            return marker; // returns object with uuid, x, & z coords

        }
    });

    // Mapping of the sweeps utilizing sweepsToMap function
    sweeps.map(sweepsToMap);

    /**
     * Author: Carlos Meza
     * Date: 8/21/2020
     * Description: Places each sweep inside the minimap at their corresponding position within the model.
     * Input: Sweep object
     * Output: Places sweep inside minimap at its correct position
     */
    function sweepsToMap(sweep)
    {
        if(sweep)
        {
            var btn = document.createElement('BUTTON'); // creates the elem
            var attList = 'sweep z-depth-3' //class defined inside styles.css
            var x = scaleToMap(sweep.x, minX, maxX, 70, 9); // these numbers give the appropiate postion for each sweep
            var y = scaleToMap(sweep.y, minY, maxY, 60, 15); // these numbers give the appropiate postion for each sweep

            btn.setAttribute('id', 'm' + sweep.mid); // setting the attributes for the button element
            btn.setAttribute('value', sweep.mid);
            btn.style.left = x + '%';   // positioning buttons accordingly to fit minimap
            btn.style.top = y + '%';
            btn.setAttribute('class', attList); // attaches  class to button element

            btn.addEventListener('click', moveToSweep); // creates an eventlistener for each button calls moveToSweep func

            map.appendChild(btn);  // attaches button to parent element MAP
        }
    }

    /**
     * Author: Carlos Meza
     * Description: Given a x and or y coord it scales the value to fit minimap
     * Input: num(x or y) min, max(x or y), scale and offset
     * Output: A corresponding x or y pos relative to minimap
     */
    function scaleToMap(num, min, max, scale, offset)
    {
        return ( ((num - min) / (max - min)) * scale ) + offset;
    }

    /**
     * Author:Carlos Meza
     * Description: sets the values needed to place sweep in correct pos of mininmap
     *
     */
    function setCoords(x,y)
    {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
    }

    /**
     * Author: Carlos Meza
     *  Description: When a sweep is selected in minimap moves user to that position
     */
    function moveToSweep(e)
    {
        return mpSdk.Sweep.moveTo(
            e.target.value || document.getElementById('m' + e).value, {
                transition: mpSdk.Sweep.Transition[settings.transition]
            })
            .then((result) => console.log(result))
            .catch((error) =>console.log(error));
    }


    // This is the entry point for mattertag search functionality
    var data = parseMattertags(mattertags);

    data.forEach(appendToUList)

    /**
     * Author: Carlos Meza
     * Description: Gathers mattertags label/ description and mattertag id
     * Input: Array of mattertags
     * Output: 2d array [[label/descrip, sid]]
     */
    function parseMattertags(mattertags)
    {
        var tags = [];
        for(i =0; i < mattertags.length; i++)
        {
            var str = mattertags[i].label + ' ' + mattertags[i].description;
            tags.push([str, mattertags[i].sid]);

        }
        tags.sort();
        return tags;
    }

    /**
     * Author: Carlos Meza
     * Description: Appends each mattertag to unordered list within index.html
     * Input: A single element from 2d array of mattertags
     * Output: Refer to description
     */
    function appendToUList(data)
    {
        var li = document.createElement('li');
        li.setAttribute('class', 'tag')
        li.textContent = data[0];
        li.setAttribute('id',data[1])
        list.appendChild(li);
    }

    /**
     * Author: Carlos Meza
     * Description: Moves the user to matter tag based on click
     * Input: List item is clicked
     * Output: User then gets moved to appropriate tag
     */
    list.addEventListener('click', (e)=> {
        mpSdk.Mattertag.navigateToTag(e.target.id);
    })

    //search input functionality activates on pressing Enter
    searchLabel.addEventListener('keyup', (e) => {
        if(e.keyCode==13)
        {
            e.preventDefault();
            search();
        }
    })

    //search input functionality via typing within searchbar
    searchLabel.addEventListener('input', search);

    //search input functionality via search button
    // this maybe removed and replaced with resetting feature
    searchBtn.addEventListener('click', search)

    /**
     * Author: Carlos Meza
     * Description: Searches 2d array of mattertags and returns 
     *              most relavent tags based on user input
     */
    function search() {
        var input, filter, ul, li, i, txtValue;
        input = searchLabel;
        filter = input.value.toLowerCase();
        ul = list;
        li = ul.getElementsByTagName('li');

        for(i =0; i < li.length; i++)
        {
            txtValue = li[i].textContent || li[i].innerText;
            if(txtValue.toLowerCase().indexOf(filter) > -1)
            {
                li[i].style.display = '';
            }
            else
            {
                li[i].style.display ='none';
            }
        }
    }

    /**
     * Author: Carlos Meza
     * Description: Allows the toggling of mattertag search functionality
     * 
     */
    tagToggle.addEventListener('click', ()=> {
        if(overlay.style.visibility == 'hidden')
        {
            overlay.style.visibility = 'visible';
        }
        else if(overlay.style.visibility == 'visible')
        {
            overlay.style.visibility ='hidden';
        }
        
    });

    /**
     * Author: Carlos Meza
     * Description: Allows the toggling of minimap functionality
     * 
     */
    mapToggle.addEventListener('click', ()=> {
        console.log('minimap toggle clicked')
        if(mapOverlay.style.visibility == 'hidden')
        {
            mapOverlay.style.visibility = 'visible';
        }
        else if(mapOverlay.style.visibility == 'visible')
        {
            mapOverlay.style.visibility ='hidden';
        }
    });

}