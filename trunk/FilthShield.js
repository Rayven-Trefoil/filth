integer drawn=0;
string OWNER;
integer mychan;
draw() {
    if (drawn == 1) return;
    llSetLinkAlpha(LINK_SET,1,ALL_SIDES);
    llWhisper(mychan,(string)(1879048192 | 8));
    llWhisper(mychan-11,"1");
    drawn=1;
}

sheath() {
    if (drawn == 0) return;
    llSetLinkAlpha(LINK_SET,0,ALL_SIDES);
    llWhisper(mychan,(string)(1610612736 | 8));    
    llWhisper(mychan-11,"2");   
    drawn=0;
}



default
{
    state_entry()
    {
       OWNER = llKey2Name(llGetOwner());
       mychan =  -(integer)("0x"+llGetSubString(llMD5String(OWNER, 0), 0, 6)) - 37621;   
       llListen(mychan-10,"",NULL_KEY,"");
       drawn=1;
       sheath();
    }

    listen(integer chan, string name, key id, string msg) {
        if ((integer)msg == 1) draw();
        if ((integer)msg == 2) sheath();        
    }
 
    attach(key who) {
        llResetScript();
    }
}
