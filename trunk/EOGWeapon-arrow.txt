string  OWNER;
vector fwd;
float mass;
vector startpos;

float VecMag(vector v) {
    return llSqrt(v.x*v.x + v.y*v.y + v.z*v.z);
}

default
{
    state_entry()
    {
        
        llCollisionSound("d4eb4f5d-e93c-3800-579f-2beef5a6b476", 1);
        llCollisionSprite("");
        llSetStatus( STATUS_ROTATE_Y | STATUS_ROTATE_X | STATUS_ROTATE_Z, FALSE);
        llSetStatus( STATUS_DIE_AT_EDGE, TRUE);        
         
              
    }
    
    on_rez(integer rezzed)
    {
        if (rezzed) {
            startpos = llGetPos();
            llSetBuoyancy(0.30);
            OWNER = llKey2Name(llGetOwner());
            fwd = llGetVel();
            mass = llGetMass();
          //  llPlaySound("190acea2-0c1f-fb5a-5035-b108b25ae91f",1);
          //  llSetTimerEvent(20);
        } else {
            llSetStatus(STATUS_PHYSICS, FALSE);
            llSetStatus(STATUS_PHANTOM, TRUE);
        }
    }
    
    collision_start(integer detected)
    {
        llApplyImpulse(-mass*fwd,FALSE);
        llSetStatus(STATUS_PHANTOM, TRUE);
        
        if (VecMag(startpos - llGetPos()) < 5) {
            llSetStatus(STATUS_PHYSICS, FALSE); 
            llSleep(3);
            llDie();
            return;
            }
        
        if ((llDetectedType(0) & AGENT) && ((llDetectedKey(0) != llGetOwner()))) {

            vector myfwd = llRot2Fwd(llGetRot());
            vector targfwd = llRot2Fwd(llDetectedRot(0));
            
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
            integer mydirection =  llRound(180*a1/PI);
            
            integer attack = (22<<9) + angle ; // numbers mean: stun, bleed, bash
            llSetObjectName(OWNER);
            llWhisper(-(integer)("0x"+llGetSubString(llMD5String(llDetectedName(0), 0), 0, 6)) -37621, (string)attack);
            llSetStatus(STATUS_PHYSICS, FALSE);                    
            llTriggerSound("f91d5919-0265-0a5d-bfae-657f578419c2",1);

            llSleep(3);
            llDie();

        } 

        llSensor("",NULL_KEY,AGENT,3.5,PI);   
        llSetStatus(STATUS_PHYSICS, FALSE);
      
    }
    
    land_collision_start(vector pos)
    {
     if (VecMag(startpos - llGetPos()) < 7) {
            llSetStatus(STATUS_PHYSICS, FALSE); 
            llSleep(3);
            llDie();
            return;
            }
                    
    llApplyImpulse(-mass*fwd,FALSE);
    llSetStatus(STATUS_PHANTOM, TRUE);    
    llSensor("",NULL_KEY,AGENT,3.5,PI);
    llSetStatus(STATUS_PHYSICS, FALSE);
    }
    
    sensor(integer tnum)
    {
        
        vector myfwd = llRot2Fwd(llGetRot());
        vector targfwd = llRot2Fwd(llDetectedRot(0));
        vector d = llDetectedPos(0) - llGetPos();
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
        integer mydirection =  llRound(180*a1/PI);
        
        integer attack = ((20 - 3*(integer)llSqrt(d.x*d.x + d.y*d.y +d.z*d.z))<<9) + angle ; // numbers mean: stun, bleed, bash
        llSetObjectName(OWNER);
        llWhisper(-(integer)("0x"+llGetSubString(llMD5String(llDetectedName(0), 0), 0, 6)) -37621, (string)attack);
                
        llTriggerSound("f91d5919-0265-0a5d-bfae-657f578419c2",1);
        llSleep(3);
        llDie();
    }
    
    no_sensor() {
        llTriggerSound("264dbd2f-c325-e291-52f7-9f1fb483a570",1);        
        //llRezObject("xxxtest",llGetPos(),<0,0,0>,<0,0,0,0>,1);
        llSleep(3);
        llDie();    
    }
    timer()
    {
        llDie();
    }
}
