import main

from main.models import Session

from main.globals import convert_goods_to_health

print("Enter session ids, comma separated")
session_ids = input().split(',')

for i in range(len(session_ids)):
    session = Session.objects.get(id=session_ids[i])

    parameter_set = session.parameter_set.json()

    for j in session.session_periods.all():
        
        summary_data = j.summary_data

        for k in session.session_players.all():
            temp_p = summary_data[str(k.id)]

            parameter_set_player = k.parameter_set_player

            good_one_total = temp_p["house_" + parameter_set_player.good_one]
            good_two_total = temp_p["house_" + parameter_set_player.good_two]
            good_three_total = temp_p["house_" + parameter_set_player.good_three]

            temp_p["health_generated_by_house"] = convert_goods_to_health(good_one_total,
                                                            good_two_total,
                                                            good_three_total if parameter_set["good_mode"] == "Three" else 0,
                                                            parameter_set)

            print(f"Player {k.id} has {good_one_total} {parameter_set_player.good_one}, {good_two_total} {parameter_set_player.good_two}, {good_three_total} {parameter_set_player.good_three}, for a total of {temp_p['health_generated_by_house']} health")
            
        j.save()    