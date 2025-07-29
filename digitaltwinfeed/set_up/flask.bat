SET environment_label=%~n0
call conda env create -f %environment_label%.yaml
call activate %environment_label%
