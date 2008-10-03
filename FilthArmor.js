
string OWNER;
integer mychan;
integer armortype;
float run;


default
{
    state_entry()
    {
       OWNER = llKey2Name(llGetOwner());
       mychan =  -(integer)("0x"+llGetSubString(llMD5String(OWNER, 0), 0, 6)) - 37621;
       list tmpvar = llCSV2List(llGetScriptName());
       if (llList2String(tmpvar,1) == "L") armortype = 64;
       if (llList2String(tmpvar,1) == "M") armortype = 192;
       if (llList2String(tmpvar,1) == "H") armortype = 448;
       tmpvar = [];
       llWhisper(mychan,(string)(1879048192 | armortype));
       llListen(mychan-5,"",NULL_KEY,"");
       llSetTimerEvent(2);
    }

    listen(integer chan, string name, key id, string msg) {
        llWhisper(mychan,(string)(1879048192 | armortype));
    }
 
    timer() {
        vector v = llGetVel();
        float norm = llFabs(llSqrt(v.x*v.x + v.y*v.y + v.z*v.z));
        norm -= 2;
        run += norm;
        if (run > 10) {
            if (armortype == 64) llWhisper(mychan, (string)(268435456 + (3<<9)));
            else if (armortype == 192) llWhisper(mychan, (string)(268435456 + (5<<9)));
            else if (armortype == 448) llWhisper(mychan, (string)(268435456 + (10<<9)));                        
            run=0;
        }
        if (run<-20) run = -20;
    }
    attach(key who) {
        if (who == NULL_KEY) {
            llWhisper(mychan,(string)(1610612736 | 448)); //takes off all armor settings
        } else {
            llResetScript();
        }

    }
}
