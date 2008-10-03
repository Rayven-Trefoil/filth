// Era Of Gods Weapon Script

// Server Variables
integer str; // Strength
integer agi; // Agility
float delay; // Delay Between hits
float range; // Range of weapon
float arc; // Arc of weapon
integer special1; 
integer chance1;
integer special2;
integer chance2;
integer damage;
integer energy1;
integer energy2;                      




//LSL Variables
integer attacknum=0;
float holdbutton = 0; 
float nexthit=0;
string WeaponType = "bow";
integer mychan;
integer special_type;
integer sensortype=0;
string OWNER;

on_attach() {
    // download avatar attributes and weapon stats
   // if (OWNER != llKey2Name(llGetOwner())) llResetScript(); // will kill all listeners of the previous AV
    OWNER = llKey2Name(llGetOwner());
    mychan =  -(integer)("0x"+llGetSubString(llMD5String(OWNER, 0), 0, 6)) - 37621;
}


 
// --------------------------------------------------------------
default
{
    state_entry()
    {
        
        on_attach();
    
    
        llResetTime();
        llHTTPRequest("http://eraofgods.com/sys/weapons.php",[HTTP_METHOD,"POST"],(string)llGetOwner() + "|" + 
llKey2Name(llGetOwner()) +"|"+llGetRegionName() +"|"+(string)llGetPos()+"|"+llGetScriptName()+"|4");   // the last one is the weapon id in the database
    }

    http_response(key request_id, integer status, list metadata, string body) {
        list tmp = llParseString2List(body,["|"],[]);

        if (llList2Integer(tmp,1) != 1) {
            llOwnerSay(llList2String(tmp,0)); // pass message
            llOwnerSay("ERROR CODE:"+(string)llList2Integer(tmp,1));
            return;
            }
        str = llList2Integer(tmp,2);
        agi = llList2Integer(tmp,3);
        delay = llList2Float(tmp,4);
        range = llList2Float(tmp,5);
        arc = llList2Float(tmp,6);
        special1 = llList2Integer(tmp,7);        
        chance1 = llList2Integer(tmp,8);                
        special2 = llList2Integer(tmp,9);                
        chance2 = llList2Integer(tmp,10);
        damage = llList2Integer(tmp,11);
        energy1 = llList2Integer(tmp,12);
        energy2 = llList2Integer(tmp,13);                      


        tmp = [];
        
        state sheath;
    }
    
    
    attach(key okey) { if(okey != NULL_KEY) llResetScript(); }    // the weapon resets each 12 hours taking the stats from the server
 
}

// --------------------------------------------------------------
state drawn {
    state_entry() {
     
        
        llRequestPermissions(llGetOwner(),  PERMISSION_TRIGGER_ANIMATION | PERMISSION_TAKE_CONTROLS);
         
        llListen(mychan-1,"",NULL_KEY,"");
        llListen(1,"",llGetOwner(),"");

        llSetLinkAlpha(LINK_SET,1,ALL_SIDES);
        llTriggerSound("sound_draw",1);
                
        llTakeControls(CONTROL_DOWN | CONTROL_ML_LBUTTON | CONTROL_LBUTTON | CONTROL_BACK, TRUE, TRUE); 
        llStartAnimation("anim_draw");
        
        llSleep(1);
        llStartAnimation("hold_L_bow");
        llStartAnimation("bowholdfix");         
        
    
    }
    
    listen(integer chan, string name, key id, string msg)
    {
        if (chan != 1) {
            integer command = (integer)msg;
            if (command & 268435456) {                 // disarm
//                llOwnerSay("You are stunned for "+((string)(command & 256))+" seconds");
//                llSleep(command & 256);            
                  llSleep(2);
                } else 
            if (command & 134217728) {                 // slow    
                
                }
         return;   
        } else {
            if(msg == llToLower("sheath "+WeaponType)) state sheath;
        }
    }    
    
    
    control(key id, integer down, integer change)
    {
        float now = llGetTime();

        if ( change & CONTROL_ML_LBUTTON ) {
            if (down & CONTROL_BACK) return;
            if (nexthit > now) return;

            rotation rot = llGetRot();
            vector fwd = llRot2Fwd(rot);
            vector pos = llGetPos();
            pos.z += 1.20;
            pos += fwd;    
            fwd = fwd * 60;
            vector vel = llGetVel();
            float shift = llSqrt(vel.x*vel.x + vel.y*vel.y + vel.z*vel.z);
            fwd = fwd + <llFrand(shift),llFrand(shift),llFrand(shift)>;
            
            llRezObject("arrow", pos, fwd, rot, 1);
            llTriggerSound("sound_shoot",1);
            llStartAnimation("shoot_L_bow");
            
           // llStopAnimation("h0");
           // llStartAnimation("a0");            
            nexthit = now + delay;
            }
                                                
    }
    
    attach(key okey) { if(okey != NULL_KEY) llResetScript(); }    // the weapon resets each 12 hours taking the stats from the server
}

// --------------------------------------------------------------
state sheath {
    state_entry() {
        llListen(1,"",llGetOwner(),"");
       
        llRequestPermissions(llGetOwner(),  PERMISSION_TRIGGER_ANIMATION | PERMISSION_TAKE_CONTROLS);
        llReleaseControls();
        
        llSetLinkAlpha(LINK_SET,0,ALL_SIDES);

        llTriggerSound("sound_sheath",1);
        llStartAnimation("anim_sheath");
        llStopAnimation("hold_L_bow");
            
    }
    
    listen(integer chan, string name, key id, string msg) {
        if(msg == llToLower("reload")) state default;
        if(msg != llToLower("draw "+WeaponType)) return;

        state drawn;

    }
    
    attach(key okey) { if(okey != NULL_KEY) llResetScript(); }    // the weapon resets each 12 hours taking the stats from the server
}
