float timefullhealth; // the time when the health will be full
float timefullenergy;
string OWNER;
string KK;
string KO;
string KS;
integer mychan = 0;
string KF="";
integer status = 0;
integer str = 10;
integer sta = 20;
integer agi = 10;
integer int = 10;
float armor_reduction = 1;
integer maxhealth = 0;
float regen_per_sec = 0.2;
float dmg_per_sec = 0;
float lastcall;
integer settings=0;
string label="";
float f_stun = 0;
float f_bleed = 0;
float f_bleed_dps;
float f_poison = 0;
float f_poison_dps;

updateLabel() {
         label = "";
        if (settings & 8) label += "(S) ";        
        if (settings & 2) label += "(Arena) ";
        if (settings & 4)  label += "(AFK) "; 
        if (settings & 32) label += "(OOC) "; 

        armor_reduction = 1; 
        if ((settings & 448) == 448) { label += "(H)"; armor_reduction = 0.5;} else 
        if ((settings & 192) == 192) { label += "(M)"; armor_reduction = 0.7;} else 
        if (settings & 64) { label += "(L)"; armor_reduction = 0.8;}

        if (label != "") label += "\n";   
}
saveSettings() {
     llHTTPRequest("http://66.103.230.111/sys/meter_savesettings.php",[HTTP_METHOD,"POST"],(string)llGetOwner() + "|" +(string)settings); 
}

integer getHealth() {
        float now = llGetTime();
        timefullhealth += ((now - lastcall)*dmg_per_sec)/regen_per_sec;
        lastcall = now;
    
        integer currentHealth = maxhealth - llRound((timefullhealth - now)*regen_per_sec);   // calculates the current health, 
                                                        // if we know when it will be full then we know how much health is missing
                                                        // couse there is 10 health missing per 2seconds  
        if (currentHealth >maxhealth) currentHealth = maxhealth;
        if (currentHealth <0) currentHealth = 0;                
        return currentHealth;
}


integer getEnergy() {
        integer currentEnergy = 100 - llRound(timefullenergy - llGetTime());   // calculates the current health,
                                                        // if we know when it will be full then we know how much health is missing
                                                        // couse there is 10 health missing per 2seconds 
        if (currentEnergy >100) currentEnergy = 100;
        if (currentEnergy <0) currentEnergy = 0;        
        return currentEnergy;
}



init() {
    OWNER = llKey2Name(llGetOwner());
    llSetObjectName("["+llGetScriptName()+"] "+OWNER);    
    mychan =  -(integer)("0x"+llGetSubString(llMD5String(OWNER, 0), 0, 6)) - 37621;
    
    llSetTimerEvent(2);
    KK = llUnescapeURL("%E2%96%93");
    KO = llUnescapeURL("%E2%96%91");
    KS = llUnescapeURL("%E2%98%BA");
    KF = KK+KK+KK+KK+KK+KK+KK+KK+KK+KK+KK;
    llListen(mychan, "", NULL_KEY, "");
    llRequestPermissions(llGetOwner(),  PERMISSION_TRIGGER_ANIMATION);

    lastcall = llGetTime();

    llMessageLinked(LINK_ALL_CHILDREN, 1, "", NULL_KEY);
    // download avatar attributes
    llHTTPRequest("http://66.103.230.111/sys/meter.php",[HTTP_METHOD,"POST"],(string)llGetOwner() + "|" + OWNER +"|"+llGetRegionName() +"|"+(string)llGetPos()+"|"+llGetScriptName());
}


default 
{
    state_entry()
    {
    
    init();  
    }
    
    attach(key who) {
        if (who != NULL_KEY) {
            llResetScript();
        } else {
            integer currentHealth = getHealth();
            if (currentHealth <70) llShout(0, "/me DETACHED METER!");
        }
    }
    
    run_time_permissions(integer perm) { // permissions dialog answered
        if (perm & PERMISSION_TAKE_CONTROLS) { // we got a yes
            llTakeControls(CONTROL_FWD | CONTROL_BACK | CONTROL_LEFT | CONTROL_RIGHT | CONTROL_UP | CONTROL_DOWN  | CONTROL_LBUTTON |CONTROL_ML_LBUTTON, TRUE,FALSE);
        }
    }

        
    http_response(key request_id, integer status, list metadata, string body) {
        list tmp = llParseString2List(body,["|"],[]);
        integer RCODE = llList2Integer(tmp,1);
        if (llStringLength(llList2String(tmp,0)) > 1)  llOwnerSay(llList2String(tmp,0)); // pass message        
        if (RCODE != 1) {
            if (RCODE == 10) {
                //settings saved we can Reset
                return;
                }

            state off;
            }

        str = llList2Integer(tmp,2);
        agi = llList2Integer(tmp,3);
        sta = llList2Integer(tmp,4);
        int = llList2Integer(tmp,5);
        settings = llList2Integer(tmp,6);

        settings = ~((~settings) |448); // clear armor bits
        llWhisper(mychan-5,"p"); // pings the armor channel to see if there is any attached        
        updateLabel();

        maxhealth = sta*5;
        regen_per_sec = 0.2;

        llOwnerSay("Str:"+(string)str+" Agi:"+(string)agi+" Sta:"+(string)sta+" Int:"+(string)int);                     
        tmp = [];
        llWhisper(mychan-20,"3,"+(string)llGetTime()+","+(string)maxhealth);

        settings = ~((~settings) |8); // clear shield bit
        llWhisper(mychan-1,"1"); // sheath all weapons
        llWhisper(mychan-10,"2"); // sheath shield
    }
             
    timer() {
        float now = llGetTime();

        
        if (f_bleed != 0) if (f_bleed<now)   { f_bleed=0;  dmg_per_sec -= f_bleed_dps;}
        if (f_poison != 0) if (f_poison<now) { f_poison=0; dmg_per_sec -= f_poison_dps;}        
        if (f_stun != 0) if (f_stun<now) { f_stun=0; llReleaseControls(); llStopAnimation("a_stun"); llStopAnimation("a_bash");}        
        
        integer currentHealth = getHealth();
        integer currentEnergy = getEnergy();

        if ( (currentHealth > 0) && (status == 1)) {        
                    // get up no more down
                    llReleaseControls();
                    llMessageLinked(LINK_ALL_CHILDREN, 1, "", NULL_KEY);
                    status = 0;
                    
                    if (settings & 2) {
                    llShout(0,"/me is in arena mode and reseted automaticaly!");
                    timefullhealth = now;
                    timefullenergy = now;
                    currentHealth = maxhealth;
                    currentEnergy = 100;
                    } else {
                     llShout(0,"/me rised up from the dirt");   
                    }
                   
                    llStopAnimation("a_dead");

                    
                    

                    }
                    

        if ((currentHealth ==0) && (status != 1)) {
                    status = 1;
            
                    if (settings & 2) { // arena
                        timefullhealth = now + 500 + 5;
                        timefullenergy = now + 100 + 5;
                        } else {
                        maxhealth = maxhealth;
                        timefullhealth = now + 500 + 300;
                        timefullenergy = now + 100 + 300;                
                        }
                        
            
                    settings = ~((~settings) |8); // clear shield bit
                    llMessageLinked(LINK_ALL_CHILDREN, 2, "", NULL_KEY);        
                    llWhisper(mychan-1,"1"); // sheath all weapons
                    llWhisper(mychan-10,"2"); // sheath shield
                    llRequestPermissions(llGetOwner(), PERMISSION_TAKE_CONTROLS | PERMISSION_TRIGGER_ANIMATION);
                    llShout(0,"/me has been crushed");   
                    llStartAnimation("a_dead");
            }
        if (currentHealth ==0) {
            integer remainingsec = llRound(timefullhealth - llGetTime() -500);
            llSetText("knockout "+(string)remainingsec+"sec. remaining", <1,0.2,0>, 1);
            } else {



        if ((timefullhealth > now) || (timefullenergy > now)) {

            llWhisper(mychan-20,"1,"+(string)currentHealth+","+(string)currentEnergy);
            
              integer points = llRound((float)currentEnergy/10);
            string ss="";
            if (points != 0) ss = llGetSubString(KF,0,points); 
             
            float color = (float)currentHealth / 100;
            
            llSetText(label+ss+"\nH:"+(string)currentHealth + "% E:"+(string)currentEnergy+"%", <1-color,color,0>, 1); 

            }  else {
               llSetText(label+KS,<0.3,1,0.3>,1);    
            }
            
            
            
         
            }
     
    
          
    }   


 listen(integer channel, string name, key id, string message)
    {
  //  float ds = llGetTime(); 
    integer attack = (integer)message;
                 
    if (attack & 1073741824) { // settings 
    
        if ((attack & 2013265920) == 2013265920) {llStopAnimation("a_dead"); if (settings & 2) llShout(0,"/me reseted their meter in arena mode!"); else llShout(0,"/me RESETED THEIR METER!"); llResetScript(); }
        
        integer bit = attack & 4294967295; // strips the system bits
        if (attack & 536870912) { // forcing the bit to
            if (attack & 268435456) // turn on
                 settings = settings | bit; 
                 else // turn off
                 settings = ~((~settings) | bit);
            } else { // switching the bit
            settings = settings ^ bit;        
            }
        if (!(bit & 8) && !(bit & 448)) saveSettings(); // wont save if we just pull shield
        updateLabel(); 
        return;    
    }
    
    
    float now = llGetTime();

    float reduction = ((attack&65535)>>9) *armor_reduction; // TODO: -str*0.2 the attack is blocked
    integer angle = attack&511;

    if (status != 0) return; // our target is down or afk or ooc

 
    if (((angle >-30) && (angle<=0)) || ((angle < 30) && (angle > 0))) reduction = reduction*2;

    if ((angle < 180) && (angle > 50) && (settings&8)) {

        llTriggerSound("7b805eda-4128-f21f-e91e-81dc6b2b0569",1); 
        reduction -= 4 + str*0.5;
        if (reduction <0) reduction = 0;
        } else
    if (attack&65536) { // stun 
            llOwnerSay("stunned");
            llStartAnimation("a_stun");            
            llRequestPermissions(llGetOwner(), PERMISSION_TAKE_CONTROLS | PERMISSION_TRIGGER_ANIMATION);
            f_stun = now + (attack>>19);
            llWhisper(mychan-1, (string)(268435456 | (attack>>19)));            

            } else
    if (attack&131072) { // bleed
            if (f_bleed > now) return; // wont stack
            f_bleed = now + 15;
            f_bleed_dps = ((float)((attack&65535)>>9))/20;        // dmg value / 20 per sec for 15 seconds
            dmg_per_sec += f_bleed_dps;

            } else 
    if (attack&262144) { // bash

            float vec = PI* ((attack>>19) - 180) /180;
            llRequestPermissions(llGetOwner(), PERMISSION_TAKE_CONTROLS | PERMISSION_TRIGGER_ANIMATION);
            f_stun = now + 1;
            integer tmp = ((attack>>19) - 180);
            if ((tmp < 135) && (tmp >45)) llStartAnimation("a_bash_r");
            if ((tmp >= 135) || (tmp <= -135))llStartAnimation("a_bash");
            if ((tmp >= -45) && (tmp <= 45)) llStartAnimation("a_bash_b");
            if ((tmp < -45) && (tmp >-135)) llStartAnimation("a_bash_l");                                    
            llMoveToTarget(llGetPos() + <llCos(vec), llSin(vec), 0>*7, 0.5);
            llSleep(0.1);
            llStopMoveToTarget();
            } else
     if (attack&524288) { // disarm
            llOwnerSay("disarmed");
            llWhisper(mychan-1, (string)(attack>>19));
            } else
     if (attack&1048576) { // poison
            if (f_poison >now) return; // wont stack
            f_poison = now + 216000;   // 1hour
            f_poison_dps = ((float)((attack&65535)>>9))/400;        // dmg value / 40 per sec for 15 seconds
            dmg_per_sec += f_poison_dps;
            return;            
            } else
     if (attack&2097152) { // lifesteal
            llOwnerSay("lifesteal");
            } else
     if (attack&8388608) { // lifesteal
            llOwnerSay("maim");
            } else
     if (attack&16777216) { // arrow
            llOwnerSay("arrow");
            } else                  
     if (attack&33554432) { // perma poison
            llOwnerSay("perma poison");
            
            } else
     if (attack&67108864) { // heal
            timefullhealth -= 5*reduction;
            return;
            } else
     if (attack&134217728) { // cure
            f_bleed=0;
            f_poison=0;
            dmg_per_sec =0;
            return;
            } else
     if (attack&268435456) {
            llOwnerSay("energy dmg"+(string)((attack&65535)>>9));
            if (timefullenergy <now) timefullenergy = now;
            timefullenergy += 2*((attack&65535)>>9);
            return;
        }
                

    
    if (timefullhealth < now) timefullhealth = now;
    if (timefullenergy < now) timefullenergy = now;
   
    integer currentEnergy = getEnergy();
    
        if (currentEnergy <5) {
            // full hit
            timefullhealth += 5*reduction;
            timefullenergy = now + 100;
        }  else {
            // defended hit
            timefullhealth += 5*reduction/3;              //15dmg / 3 = 5*5sec = 25sec
            timefullenergy += (2*reduction/3);           // 15 2/3 = 10
        }    
    
    integer currentHealth = getHealth();

    if ((currentHealth <=0) && (status ==0)) {
        status = 1;

        if (settings & 2) { // arena
            timefullhealth = now + 500 + 5;
            timefullenergy = now + 100 + 5;
            } else {
            maxhealth = maxhealth;
            timefullhealth = now + 500 + 300;
            timefullenergy = now + 100 + 300;                
            }
            

        settings = ~((~settings) |8); // clear shield bit
        llMessageLinked(LINK_ALL_CHILDREN, 2, "", NULL_KEY);        
        llWhisper(mychan-1,"1"); // sheath all weapons
        llWhisper(mychan-10,"2"); // sheath shield
        llRequestPermissions(llGetOwner(), PERMISSION_TAKE_CONTROLS | PERMISSION_TRIGGER_ANIMATION);
        llShout(0,"/me has been crushed by "+name);   
        llStartAnimation("a_dead");

        return;
    }    
    llStopAnimation("a_hit");
    llStartAnimation("a_hit");
    if (settings & 1) llTriggerSound("1a77ee8c-4a38-5a46-f173-8ee81db79776",1); else llTriggerSound("575716be-37d3-dc33-5b75-fe99d78c03eb",1);

    llShout(-(integer)("0x"+llGetSubString(llMD5String(name, 0), 0, 6)) - 37641,"2,"+OWNER+","+(string)((integer)(getHealth()/(maxhealth/100))));
    
    }

}

state off {
    state_entry() {
        llSetText("-"+KS+"-",<1,1,1>,1);
    }
    
    attach(key who) {
        if (who == NULL_KEY) state default; 
    }
}