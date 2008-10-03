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
string WeaponType = "";
integer mychan;
integer special_type;
integer sensortype=0;
integer settings=0;
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
        list tmpvar = llCSV2List(llGetScriptName());
        WeaponType = llList2String(tmpvar,1);
        settings = llList2Integer(tmpvar,3);        
        llSetObjectName(OWNER);
        llResetTime();
        llHTTPRequest("http://eraofgods.net/sys/weapons.php",[HTTP_METHOD,"POST"],(string)llGetOwner() + "|" + 
llKey2Name(llGetOwner()) +"|"+llGetRegionName() +"|"+(string)llGetPos()+"|"+llGetScriptName()+"|"+llList2String(tmpvar,2)+"|"+llKey2Name(llGetCreator()));   // the last one is the weapon id in the database
        tmpvar = [];
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
     
        if (settings & 1) llWhisper(mychan-10,(string)1); // draw shield if we have weapon that allows shield
        else llWhisper(mychan-10,(string)2); // sheath shield
   
        llWhisper(mychan-1, "1"); 
        llWhisper(mychan-2, "draw "+WeaponType);
        
        llRequestPermissions(llGetOwner(),  PERMISSION_TRIGGER_ANIMATION | PERMISSION_TAKE_CONTROLS);
         
        llListen(mychan-1,"",NULL_KEY,"");
        llListen(1,"",llGetOwner(),"");

        llSetLinkAlpha(LINK_SET,1,ALL_SIDES);
        llTriggerSound("sound_draw",1);
                
        llTakeControls(CONTROL_DOWN | CONTROL_ML_LBUTTON | CONTROL_LBUTTON, TRUE, TRUE); 
        llStartAnimation("anim_draw");
        llSleep(1);
        llStartAnimation("anim_stance");
    
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
            if (command == 1) state sheath;                
            if (command == 2) settings = settings | 2;  // turn on friendly protection
            if (command == 3) settings = ~((~settings) | 2); // turn off friendly protection
         return;   
        } else {
            if ((msg == llToLower("sheath")) || (msg == llToLower("sheath "+WeaponType))) {
                 llWhisper(mychan-10, "2"); // sheath shield 
                 state sheath;
                }
        }
    }    
    
    
    control(key id, integer down, integer change)
    {
        float now = llGetTime();

      //  integer pressed = down & change;
      //  integer specialattack0 = CONTROL_FWD | CONTROL_BACK;
      //  integer specialattack1 = CONTROL_DOWN | CONTROL_BACK;
    //    integer specialattack2 = CONTROL_FWD | CONTROL_RIGHT;
    //    integer specialattack3 = CONTROL_BACK | CONTROL_LEFT;
        // Manually Triger Specials ONLY ONE TYPE SHOULD BE ACTIVE 
//        if ((pressed & specialattack0) == specialattack0) Bash();  
        //else if ((pressed & specialattack1) == specialattack1) Bleed(); 
        //else if ((pressed & specialattack2) == specialattack2) Cleve();
        //else if ((pressed & specialattack3) == specialattack3) Disarm();
        if ((down & change) & (CONTROL_DOWN)) { 
            sensortype =1;
            llSensor("",NULL_KEY,AGENT,20,0.1);
            }
            
        if ( (~down) & change & (CONTROL_ML_LBUTTON | CONTROL_LBUTTON) ) {
            if (nexthit > now) llSleep(nexthit - now);
            if (holdbutton == 0) holdbutton = now;
            llSensor("",NULL_KEY,AGENT,range,arc);
            llStopAnimation("h"+(string)attacknum);
            llStartAnimation("a"+(string)attacknum);            
            nexthit = llGetTime() + delay;
            }

        if ((down & change) & (CONTROL_ML_LBUTTON | CONTROL_LBUTTON)) {        
            holdbutton = now;
            attacknum = (integer)llFrand(3);
            llStartAnimation("h"+(string)attacknum);
            }
                                                
    }
    
    sensor(integer tnum)
    {
        integer who=-1;          
        if (settings & 2) { // if friendly fire on
            integer i=0;
            for (i=0;i<tnum;i++) {
                if (!llDetectedGroup(i)) who=i;
            }
            if (who ==-1) return;
        } else who =0;
        
        vector myfwd = llRot2Fwd(llGetRot());
        vector targfwd = llRot2Fwd(llDetectedRot(who));
        
        if (sensortype ==1) {
            sensortype =0;
            
            llMoveToTarget(llDetectedPos(who), 0.1);
            llSleep(0.2);
            llStopMoveToTarget();
            llWhisper(mychan, (string)(268435456 + (10<<9)));
            return;   
        }
        float a1 = llAtan2(myfwd.y,myfwd.x);
        float a2 = llAtan2(targfwd.y, targfwd.x);
        float q;
        
        if ((a1 <0) && (a2>0)) q = -a1 + a2 - 2*PI;
        if ((a1 >0) && (a2>0)) q =  a2 - a1;
        if ((a1 >0) && (a2<0)) q =  a2 - a1;
        if ((a1 <0) && (a2<0)) q =  a2 - a1;
        if (q<PI) q = 2*PI + q;
        if (q>PI) q = q - 2*PI;
    
        integer angle =  llRound(180*q/PI);
        integer mydirection =  180 + llRound(180*a1/PI);
        
        float heldtime = llGetTime() - holdbutton;
        if (heldtime>2) heldtime =2;
        
        integer attack = ((damage + llRound(3*heldtime))<<9) + angle ; // numbers mean: stun, bleed, bash
        
        if ((integer)llFrand(101) < chance1) attack = attack | special1;
        if ((integer)llFrand(101) < chance2) attack = attack | special2;

        if (attack & 262144) {
               attack += (mydirection<<19);
        }
        
        llWhisper(-(integer)("0x"+llGetSubString(llMD5String(llDetectedName(who), 0), 0, 6)) -37621, (string)attack);
        llTriggerSound("sound_hit",1);
    }
    no_sensor()
    {
        llTriggerSound("sound_miss",1);
    }

    attach(key okey) { if(okey != NULL_KEY) llResetScript(); }    // the weapon resets each 12 hours taking the stats from the server
}

// --------------------------------------------------------------
state sheath {
    state_entry() {
        llListen(1,"",llGetOwner(),"");
        
        llWhisper(mychan-2, "sheath "+WeaponType);
        
        
        llRequestPermissions(llGetOwner(),  PERMISSION_TRIGGER_ANIMATION | PERMISSION_TAKE_CONTROLS);
        llReleaseControls();
        
        llSetLinkAlpha(LINK_SET,0,ALL_SIDES);

        llTriggerSound("sound_sheath",1);
        llStartAnimation("anim_sheath");
        llStopAnimation("anim_stance");
            
    }
    
    listen(integer chan, string name, key id, string msg) {
        if(msg == llToLower("reload")) state default;
        if(msg != llToLower("draw "+WeaponType)) return;

        state drawn;

    }
    
    attach(key okey) { if(okey != NULL_KEY) llResetScript(); }    // the weapon resets each 12 hours taking the stats from the server
}
