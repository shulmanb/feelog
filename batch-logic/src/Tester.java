import com.feelogg.ei.parser.EmotionsParser;

import java.util.HashMap;

/**
 * Created by IntelliJ IDEA.
 * User: Home
 * Date: 8/13/11
 * Time: 7:12 PM
 * To change this template use File | Settings | File Templates.
 */
public class Tester {
    public static void main(String[] args){
        HashMap<String,HashMap<String,Integer>> dict = new HashMap<String, HashMap<String, Integer>>();
        HashMap<String,Integer> val = new HashMap<String,Integer>();
        val.put("v",6);
        val.put("very",7);
        val.put("not",3);
        dict.put("happy",val);
        HashMap<String,Integer> val1 = new HashMap<String,Integer>();
        val.put("v",6);
        val.put("very",7);
        val.put("not",3);
        dict.put("funny",val);

        HashMap<String,Integer> smileys = new HashMap<String,Integer>();
        smileys.put(":)",6);
        dict.put("smileys",smileys);
        EmotionsParser ep = new EmotionsParser(dict);
        int res=ep.pars_post("I'm happy today. My cat cought a mouse");
        System.out.println(res);
        res=ep.pars_post("ok , until now i was loughing my way to the bank amid the big drops of rain , but now its not funny any more...rainy on monday? my first \"summer vacation day\" ???!!!");
        System.out.println(res);
        res=ep.pars_post("I'm happy today. My cat cought a mouse");
        System.out.println(res);
        res=ep.pars_post("ok , until now i was loughing my way to the bank amid the big drops of rain , but now its not funny any more...rainy on monday? my first \"summer vacation day\" ???!!!");
        System.out.println(res);
        res=ep.pars_post("I'm happy today. My cat cought a mouse");
        System.out.println(res);
        res=ep.pars_post("ok , until now i was loughing my way to the bank amid the big drops of rain , but now its not funny any more...rainy on monday? my first \"summer vacation day\" ???!!!");
        System.out.println(res);
        res=ep.pars_post("I'm happy today. My cat cought a mouse");
        System.out.println(res);
        res=ep.pars_post("ok , until now i was loughing my way to the bank amid the big drops of rain , but now its not funny any more...rainy on monday? my first \"summer vacation day\" ???!!!");
        System.out.println(res);



    }
}
