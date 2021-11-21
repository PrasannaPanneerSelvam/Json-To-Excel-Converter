from json import loads
from typing import Any, List
from xlsxwriter import Workbook
from xlsxwriter.format import Format
from xlsxwriter.worksheet import Worksheet

import os


def FetchKeysFromDictionary(json_object : dict) -> List[str]:

    """ Fetches keys as path strings from simple/nested dictionaries i.e., 
    |       Input  : { 'C:' : { 'MyFiles' : 7 } , 'D:' : "Anything" } 
    |       Output : [ "C:/MyFiles" , "D:" ]
    """
    if not dict: return []

    path_list_lambda = lambda key, value : list( map( lambda x: key + '/' + x, FetchKeysFromDictionary(value) ) )

    result_list = []
    
    for key, value in json_object.items():
        result_list += path_list_lambda(key, value) if isinstance(value, dict) else [ key ]
        
    return result_list


def GetValueFromPath(json_object: dict, path_array, index: int) -> Any:
    
    """ Fetch values from a nested/simple json object in the path represented in the path_array
    |       Input  : 
    |           json_object = { 'C:' : { 'MyFiles' : 7 } , 'D:' : "Anything" } 
    |           path_array = [ 'C:', 'MyFiles']
    |       Output : 7
    """

    if json_object is None or not isinstance(json_object, dict) or index == 0:
        return json_object

    # Reversed indexing in Python is used here
    return GetValueFromPath( json_object.get(path_array[-index], None), path_array, index - 1 )


def GetTwoDimensionalKeys(keys: List[str]) -> List[ List[str] ]:

    """ A quick summary of this function
    |  Convert the following input (path strings)
    |   
    |   [ 'Name', 'Marks/Subject1', 'Marks/Subject2', 'Address/Residential/City', 'Address/Residential/State', 'Address/Permanent/City', 'Address/Permanent/State' ]
    |
    |
    |   into the following output
    |   
    |   [ [ 'Name', 'Marks'    , 'Marks'     , 'Address'      , 'Address'      , 'Address'    , 'Address'    ]
    |   , [ ''    , 'Subject1' , 'Subject2'  , 'Residential'  , 'Residential'  , 'Permanent'  ,  'Permanent' ]
    |   , [ ''    , ''         , ''          , 'City'         , 'State'        , 'City'       ,  'State'     ]
    |   ]
    """

    if not keys:
        return []

    two_dim_keys = []

    # Creating a deep copy of the keys object
    dup_keys = [ i for i in keys ]

    # Checking all the elements are empty string
    while any(dup_keys):
        temp_list = []
        for i in range(len(dup_keys)):
            path_delimiter = '/'
            value, rem = dup_keys[i], ''

            if path_delimiter in value:
                value_list = value.split(path_delimiter)
                rem = path_delimiter.join(value_list[1:])
                value = value_list[0]

            temp_list.append(value)
            dup_keys[i] = rem

        two_dim_keys.append(temp_list)

    return two_dim_keys

def NumToExcelAlpha(column_number: int) -> str:
    
    ''' Converts zero based column number into excel format column name. i.e., 0 -> A, 25 -> Z, 26 -> 'AA', etc '''

    column_number += 1

    # number_system_base represents here the number system going to be used here is base-26 i.e., the number of alphabets
    number_system_base, ascii_of_caps_A = 26, 64

    number_to_cap_alphabet = lambda x : chr( ascii_of_caps_A + x )
    
    if column_number <= number_system_base:
        return number_to_cap_alphabet(column_number)
    
    excel_column_name = []

    while column_number >= 1:
        excel_column_name.append(column_number % number_system_base)
        column_number //= number_system_base
    
    for i in range(len(excel_column_name)-1):
        if excel_column_name[i] < 1:
            excel_column_name[i+1] -= 1
            excel_column_name[i] += number_system_base

    # Converting Integer hash values into alphabets(A-Z) and revesing the list
    excel_column_name = list( map ( number_to_cap_alphabet, excel_column_name) )[::-1]
    return ''.join(excel_column_name)


def GetDefaultCellFormat(work_book: Workbook) -> Format:
    if not Workbook:
        return None
    
    format_dict = { 
          'bold': 1
        , 'border': 1
        , 'align': 'center'
        , 'valign': 'vcenter'
        , 'fg_color': 'yellow'
        }

    return work_book.add_format(format_dict)


def MergeColumnCells(work_book: Workbook, work_sheet: Worksheet, row: int, column_start: int, column_end: int, text: str) -> None:

    # Output :- A1, B2, etc
    column_row_lambda = lambda x : NumToExcelAlpha(x) + str(row+1)

    # Sample : 'A1:D1'
    merge_range_string = ':'.join( map ( column_row_lambda, [ column_start, column_end ] ) )

    work_sheet.merge_range(merge_range_string, text, GetDefaultCellFormat(work_book) )


def MergeRowCells(work_book: Workbook, work_sheet: Worksheet, column: int, row_start: int, row_end: int, text: str) -> None:

    if not text:
        return

    cell_format = GetDefaultCellFormat(work_book)

    # If the cell is in the last row of headers, no need for merging cells
    if row_start + 1 == row_end:
        work_sheet.write(row_start, column, text, cell_format)
        return

    # Sample : 'A1:D1'
    merge_range_string = NumToExcelAlpha(column) + str(row_start+1) + ':' + NumToExcelAlpha(column) + str(row_end)
    
    work_sheet.merge_range(merge_range_string, text, cell_format)


def DetailsWriter(work_book: Workbook, work_sheet: Worksheet, excel_sheet_number: int, row: int, details_list: list) -> int:

    ''' Function to write details under respective headers in the excel table 
        Returns a list of count of characters in every cells for the respective row
    '''

    # Use the required empty value 
    empty_cell_value = 'NIL'
    format_dict = { 
          'align': 'center'
        , 'valign': 'vcenter'
        , 'fg_color': '#add8e6'
        , 'border': 1
        }

    cell_format = work_book.add_format(format_dict)

    column_width = []

    for column, value in enumerate(details_list):
        temp_cell_format = None

        # Check :- is None / empty
        if not value:
            value,temp_cell_format = empty_cell_value, cell_format

        # If value is a list
        elif isinstance(value, list):
            # If the type of list elements is non-object type
            if len(value) == 0 or not isinstance(value[0], dict):
                value = str(value)
                
            # Type of list elements is object type
            # TODO :: Nested List need to be handled i.e, [[1,2],[3,4]] , flattening the list might be applicable
            else:
                # Set the new Sheet name to the value
                value = ExcelFileWriter(work_book, excel_sheet_number + 1, value)

        work_sheet.write(row, column, value)

        column_width.append( len(str(value)) )

    return column_width

def HeaderWriter(work_book: Workbook, work_sheet: Worksheet, keys: List[str]) -> (int, List[int]):
    
    ''' Function to write header to the excel table 
        Returns the number of rows required for headers and a list of count of characters in every cells for the respective row
    '''

    two_dim_keys = GetTwoDimensionalKeys(keys)
    header_rows_number = len(two_dim_keys)

    column_max_space = [0] * len(two_dim_keys[0])

    for row_number in range(header_rows_number):
        values_list = two_dim_keys[row_number]
        values_list_len = len(values_list)

        merge_boolean, column_start = False, 0

        for column_number, current_value in enumerate(values_list):

            # If the header is empty, don't perform any action on that cell
            if current_value == '':
                continue

            next_elem = values_list[column_number+1] if column_number + 1 < values_list_len else None

            # Write the value if next cell doesn't have same value
            if not merge_boolean and next_elem != current_value:

                # Calculates maximum character in the cell to calculate maximum column width
                column_max_space[column_number] = max( len(current_value), column_max_space[column_number] )

                MergeRowCells(work_book, work_sheet, column_number, row_number, header_rows_number, current_value)

            # Merging cells until this cell
            elif merge_boolean and next_elem != current_value:
                merge_boolean = False
                MergeColumnCells(work_book, work_sheet, row_number, column_start, column_number, current_value)

            # Skipping cells with same data to its next cells
            elif not merge_boolean:
                column_start = column_number
                merge_boolean = True
        
    return header_rows_number, column_max_space


def ExcelFileWriter(work_book: Workbook, excel_sheet_number: int, json_list: list[dict]) -> str:

    """ Takes a list of objects and converts the data into an excel table in a sheet and
        returns the sheet name
    """
    

    def StringifiedPathToPathArray(keys: List[str]) -> List[ List[str] ]:

        """ Converts Path string into splitted Path string arrays 
            i.e., [ "C:/MyFiles" , "D:/Entertainment/Movies" ] -> [ [ "C:", "MyFiles" ] , [ "D:", "Entertainment", "Movies" ] ]
        """
        if not keys: return []
        
        path_delimiter = '/'

        return [ list( item.split(path_delimiter) ) if path_delimiter in item else [ item ] for item in keys ]


    keys = FetchKeysFromDictionary(json_list[0]) if json_list else []

    sheet_name = 'Sheet' + str(excel_sheet_number)

    path_array = StringifiedPathToPathArray(keys)
    
    work_sheet = work_book.add_worksheet(sheet_name)


    # Writing Headers and merge cells when required
    header_rows, column_max_space = HeaderWriter(work_book, work_sheet, keys)


    # Writing details in respective cells
    for row_number, current_item in enumerate(json_list):

        values = [ GetValueFromPath(current_item, path_array_element, len(path_array_element)) for path_array_element in path_array ]

        # I miss the pure functional programming language's syntax here 😩
        column_max_space_current_row = DetailsWriter(work_book, work_sheet, excel_sheet_number, row_number+header_rows, values)

        column_max_space = list( map (max, zip(column_max_space, column_max_space_current_row) ) )


    # Setting column width based on the maximum space required by the cell with maximum number of characters
    # Beautifying the table!!!
    for column_number, max_space_required_for_this_column in enumerate(column_max_space):
        column_name  = NumToExcelAlpha(column_number)
        column_range = column_name + ':' + column_name

        # Adding one just for a additional clearance space
        work_sheet.set_column( column_range, max_space_required_for_this_column + 1)


    return sheet_name


def JsonToExcelWriter(file_data: dict) -> bool:

    def ReadJsonFromFile(location: str) -> dict:
        """ Reads and loads a json file and returns in the form of a dictionary """
        try:
            parsed_json = None
            with open(location, 'r') as json_file:
                json_string = json_file.read()
            parsed_json = loads(json_string)
        except OSError:
            print(f'Error during reading file :- {location}')
        except:
            print('Error during parsing json')

        return parsed_json


    keys = ['inputFileName', 'outputFileName', 'jsonData']
    input_file_name, output_file_name, json_data = [ file_data.get(key) for key in keys ]

    match json_data, input_file_name:
        case None, input_json_file_name:
            loaded_json = ReadJsonFromFile(input_json_file_name)
        case _, _:
            loaded_json = json_data

    # Check :- is None
    if not loaded_json:
        return

    if not isinstance(loaded_json, list):
        loaded_json = [ loaded_json ]

    excel_sheet_number = 1
    work_book = Workbook(output_file_name)
    
    ExcelFileWriter(work_book, excel_sheet_number, loaded_json)

    work_book.close()
    
    return True


if __name__ == "__main__":

    input_directory_path = 'input'
    output_directory_path = 'output'

    try:
        if not os.path.exists(output_directory_path):
            os.mkdir(output_directory_path)
    except:
        print("Directory Creation failed")

    else:
        for file in os.listdir(input_directory_path):
            # Process only json format files and not expecting a file name with '.json' as a part of name
            match file.split('.json'):
                case [file_name, '']:
                    JsonToExcelWriter(
                        { 'inputFileName': f'{input_directory_path}/{file}'
                        , 'outputFileName': f'{output_directory_path}/{file_name}.xlsx'
                        }
                    )
                case _:
                    pass
                
