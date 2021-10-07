// This file is auto-generated by ./bin/rails stimulus:manifest:update
// Run that command whenever you add a new controller

import { application } from "./application"

import HelloController from "./hello_controller"
application.register("hello", HelloController)

import Flatpickr from 'stimulus-flatpickr'
application.register('flatpickr', Flatpickr)

import AutopickrController from "./autopickr_controller"
application.register("autopickr", AutopickrController)


import "flatpickr/dist/flatpickr.css";
import "flatpickr/dist/themes/light.css";