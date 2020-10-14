/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
/*
 * client side validations for FEA prop app
 */

 function validateFeaForm()
            {
                formObj = document.forms[0];
                validator = new FormValidator(formObj);

                //Resetting The Previous errors
                validator.setError("pipeThicknessError", "");
                validator.setError("innerDiameterError", "");

                validator.validateField("SELECT", "material", "Choose Material", "");
                validator.validateField("SELECT", "shape", "Choose a Shape", "");

                //Text Validation
                validator.validateField("TEXT", "youngsModulus", "youngs Modulus Required", "");
                validator.validateField("TEXT", "poissonsRatio", "poissons Ratio Required", "");
                validator.validateField("TEXT", "shearModulus", "shear Modulus Required", "");
                validator.validateField("TEXT", "pipeDensity", "pipe Density Required", "");
                validator.validateField("TEXT", "pipeOuterDia", "pipe Outer Diameter Required", "");

                if(document.getElementsByName("selectOpt")[0].checked)
                    validator.validateField("TEXT", "pipeThickness", "pipe Thickness Required", "");
                else
                    validator.validateField("TEXT", "innerDiameter", "Inner Diameter Required", "");

                validator.validateField("TEXT", "seaWaterDen", "seaWater Density Required", "");
                validator.validateField("TEXT", "internalFluidDensity", "Internal Fluid Density Required", "");

                /*
                validator.validateField("TEXT", "coat1Thickness", "coat1Thickness Required", "");
                validator.validateField("TEXT", "coat1Density", "coat1Density Required", "");
                validator.validateField("TEXT", "coat2Thickness", "coat2Thickness Required", "");
                validator.validateField("TEXT", "coat2Density", "coat2Density Required", "");
                 */
                validator.validateField("TEXT", "strakeDensity", "strakeDensity Required", "");
                validator.validateField("TEXT", "strakeThickness", "strakeThickness Required", "");
                validator.validateField("TEXT", "strakeArea", "strakeArea Required", "");
                validator.validateField("TEXT", "dragDia", "dragDia Required", "");

                return  validateCheckBoxes() && validator.isValidForm();
            }

            function validateCheckBoxes()
            {
                formObj = document.forms[0];
                if( !(formObj.elements["checkbox1"].checked || formObj.elements["checkbox2"].checked || formObj.elements["checkbox3"].checked) )
                {
                    document.getElementById("flexcomPropsError").innerHTML = "Choose atleast One";
                    return false;
                }
                else
                {
                    document.getElementById("flexcomPropsError").innerHTML = "";
                }
                return true;
            }



            /*
             * client side validations for ..vm stresss app
             */
                 function validateVmForm()
            {
                formObj = document.forms[0];
                validator = new FormValidator(formObj);

                // Resetting The Previous Error Fields
                validator.setError("pipeWallThicknessError", "");
                validator.setError("innerDiaError", "");

                validator.validateField("TEXT", "outerDia", " Outer Diameter is Required", "");
                if(document.getElementsByName("selectOpt")[0].checked)
                    validator.validateField("TEXT", "pipeWallThickness", "Wall Thickness required", "");
                else
                    validator.validateField("TEXT", "innerDia", " Inner Diameter required", "");
                validator.validateField("TEXT", "tolerance", " Tolerance required", "");
                validator.validateField("TEXT", "tCorrosion", " Corrosion allowance required", "");
                validator.validateField("TEXT", "yieldStrength", " Yield Strength required", "");
                validator.validateField("TEXT", "bendingMoment", " Bending Moment  required", "");
                validator.validateField("TEXT", "exterPressure", " External Pressure Required", "");
                return validator.isValidForm();
            }