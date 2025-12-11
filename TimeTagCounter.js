
var timeTagCounterTimeoutReference;
let previousTimeTagCounterMsg;
const NumHoursInDay = 2;
const NumDaysInWeek = 7;

function clearTimeTagCounter(){
    clearTimeout(timeTagCounterTimeoutReference);
}

function updateTimeTagCounter() 
{
    function applyToEachItem(functionToApply, parent) {
        functionToApply(parent);
        for (let child of parent.getChildren()) {
            applyToEachItem(functionToApply, child)
        }
    }

    function findMatchingItems(itemPredicate, parent) {
        const matches = [];

        function addIfMatch(item) {
            if (itemPredicate(item)) {
                matches.push(item)
            }
        }
        applyToEachItem(addIfMatch, parent);
        return matches
    }
    const itemHasTimeTag = item => WF.getItemNameTags(item).concat(WF.getItemNoteTags(item)).some(t => t.tag.match(/([@#])(\d+)([dhm])$/i));
    const getTimeTags = item => WF.getItemNameTags(item).concat(WF.getItemNoteTags(item)).filter(t => t.tag.match(/([@#])(\d+)([dhm])$/i) !== null);
    const matchHasTimeTag = item => item.data.search_result && item.data.search_result.matches && itemHasTimeTag(item);

    function getMinutes(str) {
        const m = str.match(/(\d+)([dhm])/i);
        if (!m) return 0;
        const value = parseInt(m[1]);
        const unit = m[2].toLowerCase();
        if (unit === "d") return value * NumHoursInDay * 60; // days to minutes
        if (unit === "h") return value * 60; // hours to minutes
        return value; // minutes
    }

    function convertMinsToStr(mins) {
        const hours = Math.floor(mins / 60);
        const netMins = mins - hours * 60;
        const days = (hours / 8).toFixed(2);
        const weeks = (days / 5).toFixed(2);
        return `${hours.toString().padStart(4," ")}h ${netMins.toString().padStart(2," ")}m | ${days.toString().padStart(2," ")} days | ${weeks.toString().padStart(2," ")} weeks`
    }

    function getTimeTagInfo(items) {
        let hashComplete = 0,
            hashInComplete = 0,
            atComplete = 0,
            atInComplete = 0;
        items.forEach(item => {
            getTimeTags(item).forEach(t => {
                let tag = t.tag,
                    addMins = getMinutes(tag);
                if (tag.startsWith("#")) {
                    item.isWithinCompleted() ? hashComplete += addMins : hashInComplete += addMins
                } else {
                    item.isWithinCompleted() ? atComplete += addMins : atInComplete += addMins
                }
            })
        });
        const hashAll = hashComplete + hashInComplete,
            atAll = atComplete + atInComplete;
        if (atAll + hashAll === 0) return null;
        hashTotals = hashAll > 0 ? `<br>#Total: \t${convertMinsToStr(hashAll)}<br> Incomplete:\t${convertMinsToStr(hashInComplete)}<br> Complete:\t${convertMinsToStr(hashComplete)}` : "";
        atTotals = atAll > 0 ? `<br>@Total:\t${convertMinsToStr(atAll)}<br> Complete:\t${convertMinsToStr(atComplete)}<br> Incomplete:\t${convertMinsToStr(atInComplete)}` : "";
        return `<pre>${hashTotals}<br>${atTotals}</pre>`
    }

    function convertTimeToStr(mins) {
        const hours = Math.floor(mins / 60);
        const days = (hours / NumHoursInDay).toFixed(2);
        const weeks = (days / NumDaysInWeek).toFixed(2);
        // return ` ${weeks.toString()} weeks (${NumDaysInWeek.toString()}d) // ${days.toString()} days (${NumHoursInDay}h) // ${hours.toString()} hrs`
        return ` ${weeks.toString()} weeks // ${days.toString()} days // ${hours.toString()} hrs`
    }

    function getTimeTagInfoSimple(items) {
        let hashComplete = 0,
            hashInComplete = 0,
            atComplete = 0,
            atInComplete = 0;
        items.forEach(item => 
        {
            getTimeTags(item).forEach(t => 
            {
                let tag = t.tag,
                    addMins = getMinutes(tag);
                if (tag.startsWith("#")) 
                {
                    item.isWithinCompleted() ? hashComplete += addMins : hashInComplete += addMins
                } 
                else 
                {
                    item.isWithinCompleted() ? atComplete += addMins : atInComplete += addMins
                }
            })
        });
        const hashAll = hashInComplete;
        const atAll = atComplete + atInComplete;
        if (atAll + hashAll === 0) return null;
        hashTotals = hashAll > 0 ? `\t${convertTimeToStr(hashAll)}` : "";
        return `${hashTotals}`
    }

    const focusedItem = WF.focusedItem();
    const currentItem = WF.currentItem();
    const parentItem = focusedItem
    ? focusedItem.equals(currentItem) ? focusedItem : focusedItem.getParent()
    : currentItem;

    const itemsToCount = WF.currentSearchQuery() 
    ? findMatchingItems(matchHasTimeTag, parentItem) 
    : findMatchingItems(itemHasTimeTag, parentItem); 

    const timeTagInfo = getTimeTagInfo(itemsToCount);
    const name = parentItem.getNameInPlainText();
    const msg = "'" + name + "'" + " === " + getTimeTagInfoSimple(itemsToCount);

    if(msg === previousTimeTagCounterMsg)
        return;

    previousTimeTagCounterMsg = msg;

    WF.hideMessage();
    clearTimeTagCounter();

    if (!timeTagInfo) 
        WF.showMessage("No Time Tags found.".bold(), true);
    else
        WF.showMessage(msg.bold(), false);
};



