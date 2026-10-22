import time
from datetime import datetime

INIT_POINT_X = 10
INIT_POINT_Y = 3.5

class GcodeGenerator:
    # set the vial position values (line 14 to 24) according to each machine!!!
    def set_vialtype(self, vial_type):
        self.vialtype = vial_type
        d = float(self.vialtype)
        #print("Vialtype :", d)
        
        vial8= 267.5+d #vial 8
        vial7= 253.5+d #vial 7
        vial6= 239.5+d #vial 6
        vial5= 225.5+d #vial 5
        vial4= 211.5+d #vial 4
        vial3= 197.5+d #vial 3
        vial2= 183.5+d #vial 2
        vial1= 169.5+d #vial 1

        pos_common= "G0Z"
        vial_9= "145" #rinse bottle
        vial_8= str(vial8) #vial 8
        vial_7= str(vial7) #vial 7
        vial_6= str(vial6) #vial 6
        vial_5= str(vial5) #vial 5
        vial_4= str(vial4) #vial 4
        vial_3= str(vial3) #vial 3
        vial_2= str(vial2) #vial 2
        vial_1= str(vial1) #vial 1
        rin_bot= "145" #rinse bottle

        pos_vial9= pos_common + vial_9 #vial 9
        pos_vial8= pos_common + vial_8 #vial 8
        pos_vial7= pos_common + vial_7 #vial 7
        pos_vial6= pos_common + vial_6 #vial 6
        pos_vial5= pos_common + vial_5 #vial 5
        pos_vial4= pos_common + vial_4 #vial 4
        pos_vial3= pos_common + vial_3 #vial 3
        pos_vial2= pos_common + vial_2 #vial 2
        pos_vial1= pos_common + vial_1 #vial 1
        self.pos_rinbot= pos_common + rin_bot #rinse bottle

        hole_pos_vial9= pos_common + str(float(vial_9)+1.5) #vial 9
        hole_pos_vial8= pos_common + str(float(vial_8)+1.5) #vial 8
        hole_pos_vial7= pos_common + str(float(vial_7)+1.5) #vial 7
        hole_pos_vial6= pos_common + str(float(vial_6)+1.5) #vial 6
        hole_pos_vial5= pos_common + str(float(vial_5)+1.5) #vial 5
        hole_pos_vial4= pos_common + str(float(vial_4)+1.5) #vial 4
        hole_pos_vial3= pos_common + str(float(vial_3)+1.5) #vial 3
        hole_pos_vial2= pos_common + str(float(vial_2)+1.5) #vial 1
        hole_pos_vial1= pos_common + str(float(vial_1)+1.5) #vial 1
        hole_pos_rinbot= pos_common + str(float(rin_bot)+1.5) #rinse bottle

        self.positions= [pos_vial1, pos_vial2, pos_vial3, pos_vial4, pos_vial5, pos_vial6, pos_vial7, pos_vial8, pos_vial9, self.pos_rinbot]
        self.hole_positions= [hole_pos_vial1, hole_pos_vial2, hole_pos_vial3, hole_pos_vial4, hole_pos_vial5, hole_pos_vial6, hole_pos_vial7, hole_pos_vial8, hole_pos_vial9, hole_pos_rinbot]
    
    def __init__(self, save_in_list):
        self.list_of_gcodes = []
        self.save_in_list = save_in_list
        
    def check_return(self, gcode):
        if self.save_in_list:
            self.list_of_gcodes.append(gcode)
            return
        else:
            return gcode

    def linear_move_xyz(self, pos_x, pos_y, pos_z, speed):
        """"A linear move traces a straight line from one point to another, ensuring that the specified axes will arrive
        simultaneously at the given coordinates (by linear interpolation). The speed may change over time following an
        acceleration curve, according to the acceleration and jerk settings of the given axes."""
        if pos_x != "":
            pos_x = str(round(float(pos_x), 3))
        if pos_y != "":
            pos_y = str(round(float(pos_y), 3))
        if pos_z != "":
            pos_z = str(round(float(pos_z), 3))
        return self.check_return(f"G1X{pos_x}Y{pos_y}Z{pos_z}F{speed}")
        
    def linear_move_x(self, pos_x, speed):
        return self.linear_move_xyz(pos_x, "", "", speed)

    def linear_move_y(self, pos_y, speed):
        return self.linear_move_xyz("", pos_y, "", speed)

    def linear_move_z(self, pos_z, speed):
        return self.linear_move_xyz("", "", pos_z, speed)

    def linear_move_xy(self, pos_x, pos_y, speed):
        return self.linear_move_xyz(pos_x, pos_y, "", speed)

    def linear_move_xz(self, pos_x, pos_z, speed):
        return self.linear_move_xyz(pos_x, "", pos_z, speed)

    def linear_move_yz(self, pos_y, pos_z, speed):
        return self.linear_move_xyz("", pos_y, pos_z, speed)

    def wait_bed_temperature(self, temperature):
        """This command optionally sets a new target bed temperature and waits for the target temperature
        to be reached before proceeding. """
        return self.check_return(f"M190R{temperature}")

    def hold_bed_temperature(self, temperature):
        '''This command sets a new bed temperature and proceeds without waiting. The temperature will be held in the background'''
        return self.check_return(f"M140S{temperature}")

    def hold_incubation_temperature(self, temperature):
        '''This command sets a new  temperature and proceeds without waiting. The temperature will be held in the background'''
        return self.check_return(f"M104S{temperature}")    

    def report_bed_temperature(self, timeIntervall):
        '''
        It can be useful for host software to track temperatures, display and graph them over time, but polling with M105 is less than optimal. 
        With M155 hosts simply set an interval and Marlin will keep sending data automatically. This method is preferred over polling with M105.
        timeIntervall in seconds
        '''
        return self.check_return(f"M155S{timeIntervall}")

    def homming(self, axis):
        """Auto-home one or more axes, moving them towards their endstops until triggered."""
        return self.check_return(f"G28{axis.upper()}")
        
    def set_position_xyz(self, pos_x, pos_y, pos_z):
        """Set the current position to the values specified."""
        return self.check_return(f"G92X{pos_x}Y{pos_y}Z{pos_z}")

    def set_position_x(self, pos_x):
        """Set the current position to the values specified."""
        return self.check_return(f"G92X{pos_x}")

    def set_position_y(self, pos_y):
        """Set the current position to the values specified."""
        return self.check_return(f"G92Y{pos_y}")

    def set_position_z(self, pos_z):
        """Set the current position to the values specified."""
        return self.check_return(f"G92Z{pos_z}")

    def set_position_xy(self, pos_x, pos_y):
        """Set the current position to the values specified."""
        return self.check_return(f"G92X{pos_x}Y{pos_y}")

    def set_position_xz(self, pos_x, pos_z):
        """Set the current position to the values specified."""
        return self.check_return(f"G92X{pos_x}Z{pos_z}")

    def set_position_yz(self, pos_y, pos_z):
        """Set the current position to the values specified."""
        return self.check_return(f"G92Y{pos_y}Z{pos_z}")

    def finish_moves(self):
        """This command causes G-code processing to pause and wait in a loop until all
        moves in the planner are completed."""
        return self.check_return(f"M400")

    def pressurize(self, pressure):
        """This command increase the pressure in the system"""
        return self.check_return(f"G97P{pressure}")

    def open_valve_frequency(self, frequency):
        """This command open and close the valve at a certain frequency"""
        return self.check_return(f"G98F{frequency}")

    def close_valve(self):
        """This command closes the valve"""
        return self.check_return(f"G40")

    def open_valve(self):
        """This command opens the valve"""
        return self.check_return(f"G41")

    def set_pin_state(self, pin, state):
        """For custom hardware not officially supported in Marlin, you can often just connect
        up an unused pin and use M42 to control it."""
        return self.check_return(f"M42P{pin}S{state}")

    def start_pump(self):
        self.check_return("G50")
        self.check_return("G4P250")
    
    def stop_pump(self):
        self.check_return("G51")
        self.check_return("G4P250")
        
    def wait(self, time):
        """pauses the command queue and waits for a period of time in seconds"""
        return self.check_return(f"G4S{time}")
    
    def wait_ms(self, time):
        """pauses the command queue and waits for a period of time in miliseconds"""
        return self.check_return(f"G4P{time}")
    
    def set_relative(self):
        """In this mode all coordinates are interpreted as relative to the last position."""
        return self.check_return(f"G91")

    def set_absolute(self):
        """In absolute mode all coordinates given in G-code are interpreted as positions in the logical coordinate space."""
        return self.check_return(f"G90")

    def check_pressure(self):
        return self.check_return(f"G95P")

    def check_temperature_humidity(self):
        return self.check_return(f"G96")

    def time_stamp(self):
        return self.create_time_stamp()
    
    def static_cleaning(self, times, frequency):
        '''Rinse an amount of times with the rinsing solution'''
        self.check_return("M92Z400")
        self.check_return("M203Z40")
        self.check_return("M42P49S0")
        self.check_return("M42P36S0")
        self.check_return("G0X129F5000")
        self.check_return("G28Z")
        self.check_return(self.pos_rinbot)
        self.down_rinsing()
        self.finish_moves()
        for i in range(times):
            self.start_pump()
            self.stop_pump()   
            self.open_valve_frequency(frequency)
        self.up()
        self.finish_moves()
        self.check_return("G28Z")
        self.finish_moves()
        self.check_return("G28X")

    def warmup_window(self, times, frequency):
        '''Warm up the nozzle with an amount of drops of rinsing solution'''
        #modified for drop volume tests
        self.check_return("M92Z400")
        self.check_return("M203Z40")
        self.check_return("M42P49S0")
        self.check_return("M42P36S0")
        self.check_return("G28Z")
        self.check_return("G0X129F5000")
        self.check_return(self.pos_rinbot)
        self.finish_moves() 
        self.down_rinsing()
        self.finish_moves() 

        a = 0
        while (a < 4):
            self.start_pump()
            self.stop_pump()
            self.open_valve_frequency(1)
            a += 1 
        i = 0
        while (i < times):
            j = 0
            self.increase()
            while (j < 25):  #25 droplets
                self.open_valve_frequency(frequency)
                self.wait_ms(200)
                j += 1
            i += 1    
        self.up()
        self.finish_moves()
        self.check_return("G28ZX")
        self.finish_moves()
        
    def set_new_zero_position(self, x, y,speed):
        self.homming("XY")
        self.linear_move_xy(x, y, speed)
        self.set_position_xy(0, 0)
        self.finish_moves()    

    def rinsing(self, nozzlediameter, rinsingSolvent,rinsingFactor):
        '''Rinse X times with the rinsing solution'''
        self.check_return("M92Z400")
        self.check_return("M203Z40")
        self.check_return("M42P49S0")
        self.check_return("M42P36S0")
        self.check_return("G0X129F5000")
        self.check_return(self.pos_rinbot)
        print("======================")
        print("Rinsing Solvent:",rinsingSolvent)
        print("======================")
        self.down_rinsing()
        self.finish_moves()
        
        sol = 0
        if nozzlediameter == '0.05':  #values not tested!
            if rinsingSolvent == 'Acetone':
                sol = 232
            elif rinsingSolvent == 'Ethyl acetate':
                sol = 261
            elif rinsingSolvent == 'Methanol':
                sol = 233
            elif rinsingSolvent == 'Ethanol':
                sol = 290
            elif rinsingSolvent == '2-Propanol':
                sol = 377
            elif rinsingSolvent == '2-Butanol':
                sol = 452
            elif rinsingSolvent == 'Water':
                sol = 272
            elif rinsingSolvent == 'Acetonitrile':
                sol = 216
            elif rinsingSolvent == 'Cyclohexane':
                sol = 352
            elif rinsingSolvent == 'Toluene':
                sol = 340
        elif nozzlediameter == '0.08':
            if rinsingSolvent == 'Acetone':
                sol = 91
            elif rinsingSolvent == 'Ethyl acetate':
                sol = 126
            elif rinsingSolvent == 'Methanol':
                sol = 103
            elif rinsingSolvent == 'Ethanol':
                sol = 148
            elif rinsingSolvent == '2-Propanol':
                sol = 205
            elif rinsingSolvent == '2-Butanol':
                sol = 158
            elif rinsingSolvent == 'Water':
                sol = 145
            elif rinsingSolvent == 'Acetonitrile':
                sol = 94
            elif rinsingSolvent == 'Cyclohexane':
                sol = 154
            elif rinsingSolvent == 'Toluene':
                sol = 130
        elif nozzlediameter == '0.10':
            if rinsingSolvent == 'Acetone':
                sol = 63
            elif rinsingSolvent == 'Ethyl acetate':
                sol = 67
            elif rinsingSolvent == 'Methanol':
                sol = 77
            elif rinsingSolvent == 'Ethanol':
                sol = 108
            elif rinsingSolvent == '2-Propanol':
                sol = 162
            elif rinsingSolvent == '2-Butanol':
                sol = 197
            elif rinsingSolvent == 'Water':
                sol = 102
            elif rinsingSolvent == 'Acetonitrile':
                sol = 64
            elif rinsingSolvent == 'Cyclohexane':
                sol = 93
            elif rinsingSolvent == 'Toluene':
                sol = 73
        elif nozzlediameter == '0.13':
            if rinsingSolvent == 'Acetone':
                sol = 62
            elif rinsingSolvent == 'Ethyl acetate':
                sol = 82
            elif rinsingSolvent == 'Methanol':
                sol = 75
            elif rinsingSolvent == 'Ethanol':
                sol = 107
            elif rinsingSolvent == '2-Propanol':
                sol = 166
            elif rinsingSolvent == '2-Butanol':
                sol = 170
            elif rinsingSolvent == 'Water':
                sol = 100
            elif rinsingSolvent == 'Acetonitrile':
                sol = 65
            elif rinsingSolvent == 'Cyclohexane':
                sol = 80
            elif rinsingSolvent == 'Toluene':
                sol = 60

        j = 0
        sol1 = float(rinsingFactor)/1.5
        sol = int(sol*sol1)
        print("Solvent Rinsing:", sol, "times")
        print("Solvent Rinsing:", rinsingFactor, "mL")
        for j in range(sol):
            self.start_pump()
            self.stop_pump()
            self.open_valve_frequency(1)
        self.up()
        self.finish_moves()
        #self.wait(300)

    def start_prinTime(self):
        return self.check_return(f"M75")
        
    def prinTime(self):
        '''this command reports the print job time'''
        return self.check_return(f"M31")

    def set_new_zero_position(self, x, y,speed):
        self.homming("XY")
        self.linear_move_xy(x, y, speed)
        self.set_position_xy(0, 0)
        self.finish_moves()

    def set_new_zero_position_x(self, x, speed):
        self.homming("X")
        self.linear_move_x(x, speed)
        self.set_position_x(7.5)
        self.finish_moves()

    def set_new_zero_position_y(self, y, speed):
        self.homming("Y")
        self.linear_move_y(y, speed)
        self.set_position_y(1)
        self.finish_moves()
   
    def up(self):
        '''Take off the needle from the vial'''
        return self.check_return(f"G0E0")
    
    def down_rinsing(self):
        '''Inject the needle into the vial'''
        return self.check_return(f"G0E46")
    
    def down_sample(self):
        '''Inject the needle on the vial'''
        return self.check_return(f"G0E48")

    def sample_rinsing(self,frequency, nozzlediameter, fluid, sample_factor): 
        '''Rinse X times with the sample and then warm up the nozzle with 80 sample drops '''
        self.check_return("G0X129F5000")
        self.finish_moves()
        print("======================")
        print("Sample Solvent:",fluid)
        print("Nozzle Diameter:",nozzlediameter)
        print("======================")
        
        sam = 0
        if nozzlediameter == '0.05':  #values not tested!
            if fluid == 'Acetone':
                sam = 147
            elif fluid == 'Ethyl acetate':
                sam = 167
            elif fluid == 'Methanol':
                sam = 148
            elif fluid == 'Ethanol':
                sam = 186
            elif fluid == '2-Propanol':
                sam = 242
            elif fluid == '2-Butanol':
                sam = 294
            elif fluid == 'Water':
                sam = 174
            elif fluid == 'Acetonitrile':
                sam = 136
            elif fluid == 'Cyclohexane':
                sam = 150
            elif fluid == 'Toluene':
                sam = 150
        elif nozzlediameter == '0.08':
            if fluid == 'Acetone':
                sam = 33
            elif fluid == 'Ethyl acetate':
                sam = 46
            elif fluid == 'Methanol':
                sam = 38
            elif fluid == 'Ethanol':
                sam = 60
            elif fluid == '2-Propanol':
                sam = 83
            elif fluid == '2-Butanol':
                sam = 97
            elif fluid == 'Water':
                sam = 56
            elif fluid == 'Acetonitrile':
                sam = 34
            elif fluid == 'Cyclohexane':
                sam = 66
            elif fluid == 'Toluene':
                sam = 52
        elif nozzlediameter == '0.10':
            if fluid == 'Acetone':
                sam = 21
            elif fluid == 'Ethyl acetate':
                sam = 25
            elif fluid == 'Methanol':
                sam = 30
            elif fluid == 'Ethanol':
                sam = 46
            elif fluid == '2-Propanol':
                sam = 70
            elif fluid == '2-Butanol':
                sam = 90
            elif fluid == 'Water':
                sam = 40
            elif fluid == 'Acetonitrile':
                sam = 22
            elif fluid == 'Cyclohexane':
                sam = 36
            elif fluid == 'Toluene':
                sam = 28
        elif nozzlediameter == '0.13':
            if fluid == 'Acetone':
                sam = 21
            elif fluid == 'Ethyl acetate':
                sam = 30
            elif fluid == 'Methanol':
                sam = 28
            elif fluid == 'Ethanol':
                sam = 42
            elif fluid == '2-Propanol':
                sam = 70
            elif fluid == '2-Butanol':
                sam = 77
            elif fluid == 'Water':
                sam = 40
            elif fluid == 'Acetonitrile':
                sam = 22
            elif fluid == 'Cyclohexane':
                sam = 31
            elif fluid == 'Toluene':
                sam = 22

        i = 0
        sam1 = float(sample_factor)/0.7
        sam = int(sam*sam1)
        print("Sample Rinsing:", sam, "times")
        print("Sample Rinsing:", sample_factor, "mL")
        for i in range(sam):
            self.start_pump()
            self.stop_pump()
            self.open_valve_frequency(1)
        '''warmup'''
        k = 0        
        while (k < 8):  #8 times
            self.start_pump()
            self.stop_pump()
            m = 0
            while (m < 10):  #10 droplets
                self.open_valve_frequency(frequency)
                self.wait_ms(200)
                m += 1
            self.start_pump()
            self.stop_pump()
            self.open_valve_frequency(1)
            #self.finish_moves()
            k += 1        

    def dry_pump(self):
        '''System trocken pumpen'''
        i=0
        while(i < 50):
            self.start_pump()
            self.stop_pump()
            self.open_valve_frequency(1)
            i += 1

    def increase(self):
        '''Start the pump once to build-up pressure'''
        i=0
        while(i < 1):
            self.start_pump()
            self.stop_pump()
            i += 1

    def application(self,frequency,list_of_bands,waitTime,speed,list_sample,rinsingPeriod,nozzlediameter,rinsingsolvent,list_fluid,table,rinsingFactor,vialtype): 
        
        self.check_return("M92Z400")    #Set Axis Steps-per-unit
        self.check_return("M203Z40")    #max feedrate
        self.check_return("M42P49S0")   #z-switch
        self.check_return("M42P36S0")   #3-way valve switch
        #print("table :: ",table)       #for testing
        decrement = rinsingPeriod       #generally is 99999
        #print("rinsingPeriod:", rinsingPeriod)  #for testing
        #print("speed: ", speed)
        #print("Vial type:", vialtype)

        sample_factors = []
        for _ in table:
            sample_factors.append(_['sample_factor'])
        vial_to_bands = {}
        for i, sample in enumerate(list_sample):
            if sample not in vial_to_bands:
                vial_to_bands[sample] = []
            vial_to_bands[sample].append(i)

        for sample_number, band_indices in vial_to_bands.items():
            i = band_indices[0]
            fluid = list_fluid[i]

            self.check_return("G0X129F5000")
            self.check_return(self.hole_positions[sample_number - 1])
            self.check_return("G0E20")
            self.finish_moves()
            self.up()
            self.finish_moves()
            self.check_return(self.positions[sample_number - 1])
            self.down_sample()
            self.finish_moves()
            self.sample_rinsing(frequency, nozzlediameter,list_fluid[i],sample_factors[i])
            self.finish_moves()
            for idx in band_indices:
                band = list_of_bands[idx]
                direction_y = 0
                local_decrement = rinsingPeriod
                for list_of_points in band:
                    self.increase()
                    local_decrement -= 1
                    for point in list_of_points:
                        if (direction_y - point[0]) > 0:
                            self.wait(waitTime)
                        self.linear_move_xy(point[0]+INIT_POINT_X, point[1]+INIT_POINT_Y, speed)
                        self.finish_moves()
                        self.open_valve_frequency(frequency)
                        #self.finish_moves()
                        direction_y = point[0]
                    if local_decrement == 0:
                        self.check_return("G0X129F5000")
                        self.finish_moves()
                        self.start_pump()
                        self.stop_pump()
                        self.open_valve_frequency(1)   #in case 99999 droplets were applied
                        local_decrement = rinsingPeriod

            # Final Rinsing of that group the bands
            self.check_return("G0X129F5000")
            self.finish_moves()
            self.up()
            self.finish_moves()
            self.rinsing(nozzlediameter,rinsingsolvent,rinsingFactor)  #rinsing after sample application

        self.check_return("M42P37S0")

    def load_vials(self):
        '''Load/Unload the vials'''
        self.check_return("G0X129F5000")
        self.check_return("G0E0")
        self.finish_moves()
        self.check_return("G28Z")
        self.finish_moves()

class GcodeGeneratorSP:   #syringe pump

    def __init__(self, save_in_list):
        self.list_of_gcodes = []
        self.save_in_list = save_in_list

    def check_return(self, gcode):
        if self.save_in_list:
            self.list_of_gcodes.append(gcode)
            return
        else:
            return gcode
    
    def start_prinTime(self):
        return self.check_return(f"M75")
        
    def prinTime(self):
        '''this command reports the print job time'''
        return self.check_return(f"M31")

    def linear_move_xyz(self, pos_x, pos_y, pos_z, speed):
        """"A linear move traces a straight line from one point to another, ensuring that the specified axes will arrive
        simultaneously at the given coordinates (by linear interpolation). The speed may change over time following an
        acceleration curve, according to the acceleration and jerk settings of the given axes."""
        if pos_x != "":
            pos_x = str(round(float(pos_x), 3))
        if pos_y != "":
            pos_y = str(round(float(pos_y), 3))
        if pos_z != "":
            pos_z = str(round(float(pos_z), 3))
        return self.check_return(f"G1X{pos_x}Y{pos_y}Z{pos_z}F{speed}")

    def linear_move_x(self, pos_x, speed):
        return self.linear_move_xyz(pos_x, "", "", speed)

    def linear_move_y(self, pos_y, speed):
        return self.linear_move_xyz("", pos_y, "", speed)

    def linear_move_z(self, pos_z, speed):
        return self.linear_move_xyz("", "", pos_z, speed)

    def linear_move_xy(self, pos_x, pos_y, speed):
        return self.linear_move_xyz(pos_x, pos_y, "", speed)

    def linear_move_xz(self, pos_x, pos_z, speed):
        return self.linear_move_xyz(pos_x, "", pos_z, speed)

    def linear_move_yz(self, pos_y, pos_z, speed):
        return self.linear_move_xyz("", pos_y, pos_z, speed)

    def wait_bed_temperature(self, temperature):
        """This command optionally sets a new target bed temperature and waits for the target temperature
        to be reached before proceeding. """
        return self.check_return(f"M190R{temperature}")

    def hold_bed_temperature(self, temperature):
        '''This command sets a new bed temperature and proceeds without waiting. The temperature will be held in the background'''
        return self.check_return(f"M140S{temperature}")

    def report_bed_temperature(self, timeIntervall):
        '''
        It can be useful for host software to track temperatures, display and graph them over time, but polling with M105 is less than optimal. 
        With M155 hosts simply set an interval and Marlin will keep sending data automatically. This method is preferred over polling with M105.
        timeIntervall in seconds
        '''
        return self.check_return(f"M155S{timeIntervall}")

    def homming(self, axis):
        """Auto-home one or more axes, moving them towards their endstops until triggered."""
        return self.check_return(f"G28{axis.upper()}")

    def set_position_xyz(self, pos_x, pos_y, pos_z):
        """Set the current position to the values specified."""
        return self.check_return(f"G92X{pos_x}Y{pos_y}Z{pos_z}")

    def set_position_x(self, pos_x):
        """Set the current position to the values specified."""
        return self.check_return(f"G92X{pos_x}")

    def set_position_y(self, pos_y):
        """Set the current position to the values specified."""
        return self.check_return(f"G92Y{pos_y}")

    def set_position_z(self, pos_z):
        """Set the current position to the values specified."""
        return self.check_return(f"G92Z{pos_z}")

    def set_position_xy(self, pos_x, pos_y):
        """Set the current position to the values specified."""
        return self.check_return(f"G92X{pos_x}Y{pos_y}")

    def set_position_xz(self, pos_x, pos_z):
        """Set the current position to the values specified."""
        return self.check_return(f"G92X{pos_x}Z{pos_z}")

    def set_position_yz(self, pos_y, pos_z):
        """Set the current position to the values specified."""
        return self.check_return(f"G92Y{pos_y}Z{pos_z}")

    def finish_moves(self):
        """This command causes G-code processing to pause and wait in a loop until all
        moves in the planner are completed."""
        return self.check_return(f"M400")

    def pressurize(self, pressure):
        """This command increase the pressure in the system"""
        return self.check_return(f"G97P{pressure}")

    def open_valve_frequency(self, frequency):
        """This command open and close the valve at a certain frequency"""
        return self.check_return(f"G98F{frequency}")

    def close_valve(self):
        """This command closes the valve"""
        return self.check_return(f"G40")

    def open_valve(self):
        """This command opens the valve"""
        return self.check_return(f"G41")

    def set_pin_state(self, pin, state):
        """For custom hardware not officially supported in Marlin, you can often just connect
        up an unused pin and use M42 to control it."""
        return self.check_return(f"M42P{pin}S{state}")
    
    def wait(self, time):
        """pauses the command queue and waits for a period of time in seconds"""
        return self.check_return(f"G4S{time}")
    
    def wait_ms(self, time):
        """pauses the command queue and waits for a period of time in miliseconds"""
        return self.check_return(f"G4P{time}")
    
    def set_relative(self):
        """In this mode all coordinates are interpreted as relative to the last position."""
        return self.check_return(f"G91")

    def set_absolute(self):
        """In absolute mode all coordinates given in G-code are interpreted as positions in the logical coordinate space."""
        return self.check_return(f"G90")

    def check_pressure(self):
        return self.check_return(f"G95P")

    def rinsing(self):
        self.check_return("M92Z1600")     #Set Axis Steps-per-unit, syringe pump motor
        self.check_return("M203Z5")       #max feedrate
        self.check_return("M42P49S255")   #z-switch
        self.check_return("M42P36S255")   #3-way valve switch
        self.check_return("G0X129F5000")
        self.pressurize("10")
        self.open_valve_frequency("2")
        self.check_return("G28X")

    def set_new_zero_position(self, x, y,speed):
        self.homming("XY")
        self.linear_move_xy(x, y, speed)
        self.set_position_xy(0, 0)
        self.finish_moves()

    def set_new_zero_position_x(self, x, speed):
        self.homming("X")
        self.linear_move_x(x, speed)
        self.set_position_x(0)
        self.finish_moves()

    def set_new_zero_position_y(self, y, speed):
        self.homming("Y")
        self.linear_move_y(y, speed)
        self.set_position_y(0)
        self.finish_moves()

    

