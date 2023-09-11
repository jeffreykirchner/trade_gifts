import math

from decimal import Decimal

from main.globals import round_half_away_from_zero

def convert_goods_to_health(good_one_amount, good_two_amount, good_three_amount, parameter_set):
    '''
    convert goods to health
    '''

    alpha = Decimal(parameter_set["consumption_alpha"])
    beta = Decimal(parameter_set["consumption_beta"])
    good_one_amount = Decimal(good_one_amount)
    good_two_amount = Decimal(good_two_amount)
    # good_three_amount = good_three_amount

    multipliers = parameter_set["consumption_multiplier"].split("\n")

    if good_three_amount >= len(multipliers):
        multiplier = Decimal(multipliers[-1])
    elif good_three_amount == 0:
        multiplier = 1
    else:
        multiplier = Decimal(multipliers[good_three_amount-1])

    health = (beta * good_one_amount ** (1/alpha) + beta * good_two_amount ** (1/alpha))**alpha
    health *= Decimal(multiplier)
    
    health = round_half_away_from_zero(health, 1)

    return str(health)